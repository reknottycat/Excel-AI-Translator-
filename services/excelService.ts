import { TranslationEntry, MatchPolicy, TranslatedFile } from '../types';

// ExcelJS is loaded from a CDN in index.html, so we declare it here
declare const ExcelJS: any;

/**
 * Helper to check if a string is purely numeric (integers, decimals, negative).
 * It excludes strings with letters, symbols (like $, %, ,), or spaces within.
 * @param s The string to check.
 * @returns True if the string is purely numeric, false otherwise.
 */
const isPurelyNumeric = (s: string): boolean => {
    const str = s.trim();
    if (str === '') return false;
    // This regex matches:
    // ^         - start of string
    // -?        - optional minus sign
    // \d+       - one or more digits
    // (\.\d+)?  - optionally, a decimal point followed by one or more digits
    // $         - end of string
    return /^-?\d+(\.\d+)?$/.test(str);
};


/**
 * Extracts text from various drawing elements like shapes, text boxes, and charts.
 * This function relies on the internal, undocumented structure of the ExcelJS workbook object,
 * as there is no official public API for accessing drawing text.
 * This approach might be fragile and could break with future ExcelJS updates.
 * @param worksheet The ExcelJS worksheet object.
 * @param allTexts A Set to which the extracted texts will be added.
 */
const extractTextsFromDrawings = (worksheet: any, allTexts: Set<string>) => {
  // The _drawings property is an internal representation of shapes, charts, etc.
  const drawings = worksheet._drawings;

  if (drawings && drawings.anchors) {
    drawings.anchors.forEach((anchor: any) => {
      // Text can be in different places depending on the element type (shape, chart, etc.)
      // We check for common locations where text bodies are stored.
      const shape = anchor.graphicFrame || (anchor.shape && anchor.shape.spPr); // Charts and SmartArt || Regular shapes
      
      // The text body is typically in a 'txBody' element.
      if (shape && shape.txBody && shape.txBody.p) {
        const paragraphs = Array.isArray(shape.txBody.p) ? shape.txBody.p : [shape.txBody.p];
        
        paragraphs.forEach((p: any) => {
          if (p.r) { // 'r' represents a "run" of text with the same formatting.
            const runs = Array.isArray(p.r) ? p.r : [p.r];
            runs.forEach((run: any) => {
              // 't' is the actual text content.
              if (run.t && typeof run.t === 'string' && run.t.trim()) {
                const text = run.t.trim();
                if (!isPurelyNumeric(text)) {
                    allTexts.add(text);
                }
              } else if (run.t && run.t._ && typeof run.t._ === 'string' && run.t._.trim()) {
                // Sometimes text is nested inside a '_' property
                const text = run.t._.trim();
                if (!isPurelyNumeric(text)) {
                    allTexts.add(text);
                }
              }
            });
          } else if (p.t && typeof p.t === 'string' && p.t.trim()) {
             // Fallback for simpler text elements
             const text = p.t.trim();
             if (!isPurelyNumeric(text)) {
                allTexts.add(text);
             }
          }
        });
      }
    });
  }
};


export const extractTextsFromFiles = async (files: File[], translateFormulas: boolean, preserveRichTextFormatting: boolean, extractFromShapes: boolean, processVisibleSheetsOnly: boolean): Promise<string[]> => {
  const allTexts = new Set<string>();

  for (const file of files) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    workbook.eachSheet((worksheet: any) => {
      // Skip hidden sheets if the option is enabled
      if (processVisibleSheetsOnly && worksheet.state !== 'visible') {
        return;
      }
        
      // 1. Extract texts from shapes, text boxes, and charts if enabled
      if (extractFromShapes) {
          extractTextsFromDrawings(worksheet, allTexts);
      }

      // 2. Extract texts from cells. Iterate over all cells to ensure none are missed.
      worksheet.eachRow({ includeEmpty: true }, (row: any) => {
        row.eachCell({ includeEmpty: true }, (cell: any) => {
          // A cell is its own master if it is not part of a merged range, or
          // if it is the top-left ('master') cell of a merged range.
          // We only process the master cell to avoid duplicate text extraction.
          if (cell.master !== cell) {
            return;
          }
          
          if (cell.formula) {
            if (translateFormulas && typeof cell.formula === 'string') {
              const stringLiterals = cell.formula.match(/"([^"]*)"/g);
              if (stringLiterals) {
                  stringLiterals.forEach((literal: string) => {
                      // Remove surrounding quotes and add to set
                      const text = literal.substring(1, literal.length - 1);
                      if (text.trim() && !isPurelyNumeric(text)) {
                          allTexts.add(text.trim());
                      }
                  });
              }
            }
            // After checking the formula, skip to the next cell to avoid processing the calculated value.
            return;
          }

          if (!cell.value) {
            return;
          }
          
          // Handle Rich Text specifically, as it requires special parsing
          if (cell.richText && Array.isArray(cell.richText)) {
            if (preserveRichTextFormatting) {
                // Handle rich text run-by-run to preserve formatting context later
                cell.richText.forEach((run: any) => {
                  if (run.text && run.text.toString().trim()) {
                    const text = run.text.toString().trim();
                    if (!isPurelyNumeric(text)) {
                        allTexts.add(text);
                    }
                  }
                });
            } else {
                // Handle rich text as a single plain text unit for better translation context.
                // cell.text correctly concatenates all rich text runs.
                const fullText = cell.text.toString().trim();
                if (fullText && !isPurelyNumeric(fullText)) {
                    allTexts.add(fullText);
                }
            }
          } else if (cell.value) {
            // For all other cell types (plain text, numbers, dates, etc.),
            // use cell.text to get the formatted string representation.
            const text = cell.text.toString().trim();
            if (text && !isPurelyNumeric(text)) {
                allTexts.add(text);
            }
          }
        });
      });
    });
  }
  return Array.from(allTexts);
};


export const translateFile = async (file: File, dictionary: TranslationEntry[], preserveRichTextFormatting: boolean): Promise<TranslatedFile> => {
    // 1. Pre-process dictionary for efficiency
    const exactMatchMap = new Map<string, string>();
    const flexibleEntries: TranslationEntry[] = [];

    for (const entry of dictionary) {
        exactMatchMap.set(entry.source.trim().toLowerCase(), entry.target);
        if (entry.policy === MatchPolicy.FLEXIBLE) {
            flexibleEntries.push(entry);
        }
    }
    // Sort flexible entries by length, descending, for longest match priority
    flexibleEntries.sort((a, b) => b.source.length - a.source.length);

    // 2. Read file
    const workbook = new ExcelJS.Workbook();
    // ExcelJS preserves images and styles when loading and saving
    await workbook.xlsx.load(await file.arrayBuffer());

    // 3. Iterate and translate cells
    // NOTE: Text from shapes/charts is NOT replaced due to library limitations.
    // The extracted text is in the dictionary for manual user replacement.
    workbook.eachSheet((worksheet: any) => {
        worksheet.eachRow({ includeEmpty: true }, (row: any) => {
            row.eachCell({ includeEmpty: true }, (cell: any) => {
                // A cell is its own master if it is not part of a merged range, or
                // if it is the top-left ('master') cell of a merged range.
                // We only process the master cell to avoid duplicate translations.
                if (cell.master !== cell) {
                    return;
                }
                
                // Priority 1: Handle formulas if they exist. This is a separate logic path.
                if (cell.formula && typeof cell.formula === 'string') {
                    const originalFormula = cell.formula;
                    
                    const translatedFormula = originalFormula.replace(/"([^"]*)"/g, (match, content) => {
                        if (!content.trim()) {
                            return match; // Return original if empty or just whitespace
                        }

                        let translatedContent = content;
                        const lowerContent = content.trim().toLowerCase();

                        // Priority A: Full literal exact match (case-insensitive)
                        if (exactMatchMap.has(lowerContent)) {
                            translatedContent = exactMatchMap.get(lowerContent)!;
                        } else {
                            // Priority B: Flexible/partial matches for entries with that policy
                            for (const entry of flexibleEntries) {
                                const regex = new RegExp(entry.source.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                                if (regex.test(translatedContent)) {
                                    translatedContent = translatedContent.replace(regex, entry.target);
                                }
                            }
                        }
                        
                        // Re-add quotes for the formula, escaping any new quotes inside the translated string.
                        // JSON.stringify is a safe way to do this.
                        return JSON.stringify(translatedContent);
                    });
                    
                    if (cell.formula !== translatedFormula) {
                        cell.value = { formula: translatedFormula };
                    }
                    
                    // After processing the formula, we are done with this cell.
                    return;
                }

                // Priority 2: Handle non-formula cells
                if (!cell.value) {
                    return;
                }
                
                // Handle rich text content
                if (cell.richText && Array.isArray(cell.richText)) {
                    if (preserveRichTextFormatting) {
                        // Translate run-by-run to preserve formatting, using exact matches only
                        const newRichTextRuns: any[] = [];
                        cell.richText.forEach((run: any) => {
                            if (run.text) {
                                const trimmedSource = run.text.trim().toLowerCase();
                                const translatedRunText = exactMatchMap.get(trimmedSource) || run.text;
                                newRichTextRuns.push({ font: run.font, text: translatedRunText });
                            }
                        });
                        cell.value = { richText: newRichTextRuns };
                    } else {
                        // Translate as a single block of text and replace the cell content, losing formatting.
                        let translatedText = cell.richText.map((r: any) => r.text).join('');
                        const lowerText = translatedText.trim().toLowerCase();

                        // Priority 1: Full cell exact match (case-insensitive)
                        if (exactMatchMap.has(lowerText)) {
                            translatedText = exactMatchMap.get(lowerText)!;
                        } else {
                            // Priority 2: Flexible/partial matches
                            for (const entry of flexibleEntries) {
                                const regex = new RegExp(entry.source.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                                if (regex.test(translatedText)) {
                                  translatedText = translatedText.replace(regex, entry.target);
                                }
                            }
                        }
                        
                        if (cell.text !== translatedText) {
                            cell.value = translatedText;
                        }
                    }
                } 
                // Handle plain text cell, allowing flexible matching
                else if (typeof cell.value === 'string') {
                    let translatedText = cell.value;
                    const lowerText = translatedText.trim().toLowerCase();

                    // Priority 1: Full cell exact match (case-insensitive)
                    if (exactMatchMap.has(lowerText)) {
                        translatedText = exactMatchMap.get(lowerText)!;
                    } else {
                        // Priority 2: Flexible/partial matches for entries with that policy
                        for (const entry of flexibleEntries) {
                            // Use case-insensitive regex for replacement
                            const regex = new RegExp(entry.source.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                            if (regex.test(translatedText)) {
                              translatedText = translatedText.replace(regex, entry.target);
                            }
                        }
                    }
                    
                    if (cell.value !== translatedText) {
                        cell.value = translatedText;
                    }
                }
            });
        });
    });
    
    // 4. Write new file buffer
    const outputBuffer = await workbook.xlsx.writeBuffer();

    return {
        name: file.name,
        blob: new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    };
};