// Export InDesign projects to JSON for web applications.
// Author: Tali Y. Despins
// Web: www.tdespins.com

// Export InDesign content to JSON file for development use.
// Change ONLY the variables in the USER CONFIG section for each project.

function main() {
    if (app.documents.length === 0) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;

    // ==========================
    //        USER CONFIG
    // ==========================
    // Edit this section for each project.

    // 1) PARAGRAPH STYLES (as named in your InDesign document)
    // ---------------------------------------------------------
    // Paragraph style that starts a new record (e.g. product)
    var STYLE_RECORD_TITLE   = "Product_Title";            // e.g. "Product_Title"

    // Other paragraph styles you want to capture:
    var STYLE_INTRO          = "Introduction";             // e.g. "Introduction"
    var STYLE_INTRO_ALT      = "Introduction_start anywhere"; // e.g. alternative intro style
    var STYLE_DESCRIPTION    = "Normal";                   // e.g. "Normal"

    // 2) JSON KEYS (what you want in the JSON output)
    // ------------------------------------------------
    var KEY_RECORD_TITLE     = "product_title";            // e.g. "product_title"
    var KEY_INTRODUCTION     = "introduction";             // e.g. "introduction"
    var KEY_DESCRIPTION      = "description";              // e.g. "description"

    // 3) STYLE → JSON KEY MAPPING
    // ------------------------------------------------
    // Map each paragraph style to a JSON field.
    // You can reuse the same key for multiple styles.
    //
    // To ADD an additional style:
    //   a) Create a new STYLE_* variable above.
    //   b) Optionally create a new KEY_* variable above.
    //   c) Add a line here: STYLE_MAPPING[STYLE_YOUR_NEW_STYLE] = KEY_YOUR_KEY;

    var STYLE_MAPPING = {};
    STYLE_MAPPING[STYLE_INTRO]     = KEY_INTRODUCTION;
    STYLE_MAPPING[STYLE_INTRO_ALT] = KEY_INTRODUCTION; // same JSON field as intro
    STYLE_MAPPING[STYLE_DESCRIPTION] = KEY_DESCRIPTION;

    // 4) JSON KEY OUTPUT ORDER
    // ------------------------------------------------
    // This controls the order of fields in each JSON record.
    // Include whatever keys you use above, in the order you want them.
    var KEY_ORDER = [
        KEY_RECORD_TITLE,
        KEY_INTRODUCTION,
        KEY_DESCRIPTION
        // Add more KEY_* variables here if you introduce new ones.
    ];

    // 5) BASE FILENAME (without version and extension)
    // ------------------------------------------------
    var BASE_FILENAME = "chapter-export";   // e.g. "chapter-export"

    // ==========================
    //   END USER CONFIG
    // ==========================

    var records = [];
    var currentRecord = null;
    
    // Loop through all pages
    for (var i = 0; i < doc.pages.length; i++) {
        var page = doc.pages[i];
        $.writeln("Processing page " + (i + 1));
        
        // Get all text frames on the page
        var textFrames = page.textFrames;
        
        for (var tf = 0; tf < textFrames.length; tf++) {
            var textFrame = textFrames[tf];
            var paragraphs = textFrame.paragraphs;
            
            for (var p = 0; p < paragraphs.length; p++) {
                var para = paragraphs[p];
                var styleName = para.appliedParagraphStyle.name;
                
                $.writeln(
                    "  Paragraph " + p + 
                    " has style: '" + styleName + 
                    "' - Content preview: " + 
                    para.contents.substring(0, 40).replace(/[\r\n]/g, " ")
                );
                
                var content = para.contents;
                var trimmedContent = content.replace(/^\s+|\s+$/g, "");
                if (trimmedContent.length === 0) {
                    continue; // skip empty paragraphs
                }

                // If this paragraph style is the record title style, start a new record
                if (styleName === STYLE_RECORD_TITLE) {
                    if (currentRecord !== null && hasRecordContent(currentRecord)) {
                        records.push(currentRecord);
                        $.writeln("  >> SAVING previous record and starting NEW record");
                    }
                    
                    currentRecord = {};
                    currentRecord[KEY_RECORD_TITLE] = trimmedContent;
                    $.writeln("  >> NEW record: " + trimmedContent.substring(0, 50));
                }
                // Otherwise, check if this style is mapped to a JSON key
                else if (STYLE_MAPPING.hasOwnProperty(styleName)) {
                    var jsonKey = STYLE_MAPPING[styleName];

                    if (currentRecord !== null) {
                        // If this key already exists, concatenate
                        if (currentRecord.hasOwnProperty(jsonKey)) {
                            $.writeln("  >> CONCATENATING to existing " + jsonKey);
                            currentRecord[jsonKey] += " " + trimmedContent;
                        } else {
                            $.writeln("  >> NEW entry for " + jsonKey);
                            currentRecord[jsonKey] = trimmedContent;
                        }
                        $.writeln("  Found " + styleName + ": " + trimmedContent.substring(0, 50));
                    } else {
                        $.writeln("  >> SKIPPING (no record started yet): " + trimmedContent.substring(0, 50));
                    }
                }
            }
        }
    }
    
    // Add the last record if it exists
    if (currentRecord !== null && hasRecordContent(currentRecord)) {
        records.push(currentRecord);
    }
    
    // Convert to JSON
    var jsonOutput = formatJSONArray(records, KEY_ORDER);
    
    // Save the file with auto-incrementing version number
    var docFolder = doc.filePath;
    var extension = ".json";
    var versionNumber = 1;
    var saveFile;

    // Find the next available version number
    do {
        var paddedNumber = (versionNumber < 10) ? "0" + versionNumber : String(versionNumber);
        var fileName = BASE_FILENAME + "-" + paddedNumber + extension;
        saveFile = new File(docFolder + "/" + fileName);
        versionNumber++;
    } while (saveFile.exists);

    // Show save dialog with the suggested filename
    saveFile = File.saveDialog("Save JSON file", "JSON files:*.json", saveFile);
    
    if (saveFile) {
        saveFile.open("w");
        saveFile.encoding = "UTF8";
        saveFile.lineFeed = "Unix";
        saveFile.write(jsonOutput);
        saveFile.close();
        
        var response = confirm(
            "Content extracted successfully!\n\nPages processed: " + 
            doc.pages.length + "\nRecords created: " + 
            records.length + "\n\nSaved to:\n" + saveFile.fsName + 
            "\n\nOpen the file now?"
        );
        
        if (response) {
            saveFile.execute();
        }
    }
}

function hasRecordContent(record) {
    for (var key in record) {
        if (record.hasOwnProperty(key)) {
            return true;
        }
    }
    return false;
}

function formatJSONArray(records, keyOrder) {
    var lines = [];
    lines.push("[");
    
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        lines.push("  {");
        
        // Build ordered list of keys that actually exist in this record
        var orderedKeys = [];
        for (var k = 0; k < keyOrder.length; k++) {
            if (record.hasOwnProperty(keyOrder[k])) {
                orderedKeys.push(keyOrder[k]);
            }
        }
        
        // Add any additional keys not in our predefined order
        for (var key in record) {
            if (record.hasOwnProperty(key)) {
                var found = false;
                for (var m = 0; m < keyOrder.length; m++) {
                    if (key === keyOrder[m]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    orderedKeys.push(key);
                }
            }
        }
        
        // Write out the keys in order
        for (var j = 0; j < orderedKeys.length; j++) {
            var kname = orderedKeys[j];
            var value = record[kname];
            var line = '    "' + escapeJSON(kname) + '": "' + escapeJSON(value) + '"';
            
            if (j < orderedKeys.length - 1) {
                line += ",";
            }
            
            lines.push(line);
        }
        
        if (i < records.length - 1) {
            lines.push("  },");
        } else {
            lines.push("  }");
        }
    }
    
    lines.push("]");
    return lines.join("\n");
}

function escapeJSON(str) {
    // Convert to string
    str = String(str);
    
    // Remove InDesign special characters:
    // - Remove all control characters (U+0000 to U+001F)
    // - Remove DEL character (U+007F)
    // - Remove C1 control characters (U+0080 to U+009F)
    str = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");
    
    // Remove common InDesign-specific invisible characters
    str = str.replace(/[\uFEFF\u200B\u200C\u200D]/g, ""); // Zero-width spaces
    str = str.replace(/[\u2028\u2029]/g, "");             // Line/paragraph separators
    
    // Standard JSON escaping
    return str.replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"')
              .replace(/\n/g, "\\n")
              .replace(/\r/g, "\\r")
              .replace(/\t/g, "\\t");
}

try {
    main();
} catch (e) {
    alert("Error: " + e.message + "\n\nLine: " + e.line);
}
