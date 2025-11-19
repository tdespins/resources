
# 🌟 **GREP Quickies**

### *Generalized for Public Use*

**Author:** Tali Despins

---

# 🔼 **Superscript Rules**

### **Ordinal Suffixes**

Examples: `10th`, `1st`, `21st`, `July 4th`, `2nd place`, `101st Airborne`

Additional examples: `42nd Parallel`, `5th Avenue`, `101st Dalmatians`

```regex
(?<=\d)(th|st)
```

### **Unit/Number Superscripts (Science & Business)**

Examples: `cm-1`, `Level-1`, `Phase-2`

```regex
(?<=cm)-1
```

---

# 🔽 **Subscript Rules**

### **Chemical & Generic Formulas**

Examples: `CO2`, `CH4`, `SiO2`

Additional examples (generic): `A1`, `B2B`, `Group 4`, `Section 3A` → matches only the number

```regex
(?<=CO)2|(?<=CH)4|(?<=SiO)2
```

### **Ordinal “rd” Subscript**

Examples: `23rd Street`

```regex
(?<=\d)rd
```

---

# 🔒 **No-Break Rules**

### **Keep Unit–Number Together**

Examples: `cm-1`, `Level-1`, `Phase-2`

```regex
(?<=cm)-1
```

### **Do Not Break Measurements**

Examples: `300 degrees`, `25 mm`, `10 mL`, `50 miles`, `200 steps`

More examples: `12 ft`, `30 kg`, `100 watts`, `250 Hz`

```regex
\d+ °|\d+ mm|\d+ cm-1|\d+ microns|\d+ mL|\d+ degrees
```

### **Prevent Orphans (Keep Last 15 Characters)**

Examples: `ProductCode-XYZ123`

```regex
.{15}$
```

### **Prevent Hyphenation of Hyphenated Words**

Examples: `well-known`, `long-term`, `part-time`

```regex
\b\w+?-\w+?\b
```

---

# ➗ **Display Fractions**

Examples: `3/4`, `10/2`, `1/2 cup`, `5/8 inch`

Additional examples: `3/4 cup`, `1/2 tablespoon`, `1/8 inch`

```regex
\d+/\d+
```

---

# 🇬🇷 **Swap Fonts for Greek Letters**

Examples: `λ`, `θ`

```regex
λ|θ
```

---

# 🔠 **Capitalization Rules**

### **Capitalize First Letter With Exceptions**

Examples: `value of the number` → `Value of the Number`

More examples: `story of the century` → `Story of the Century`, `power of one` → `Power of One`

```regex
\s\l|[-\s]\l(?!(f|he|o|y|nd?|rom|or|r|ut)?\b)]
```

### **Capitalize All Words Except**

Exceptions: `for`, `of`, `the`, `and`

```regex
\b(?!(for|of|the|and)\b)[\u\l]
```

### **Case-Insensitive Version**

```regex
(?i)\b(?!(for|of|the|and)\b)[\u\l]
```

### **Match Any First Letter**

```regex
\b[\u\l]
```

---

# 🅰️ **Small Caps Exception List**

Examples: connector words (`or`, `with`, `for`)

Additional useful exceptions: `and`, `the`, `from`, `to`

```regex
|or|with|for|mm|x|and|the|from|to
```

---

# 🟦 **Style All Text Inside Parentheses**

Examples: `(sample text)`, `(2025 results)`, `(see details)`

Additional examples: `(fig. 2)`, `(notes pending)`, `(copyright 2025)`

```regex
(.+?)
```

---

# 📚 **Additional GREP Summary Section**

### **Everything After a Colon**

Examples: `Title: content`, `Note: see below`

```regex
:.*
```

### **Superscript: Unit Numbers & Ordinals**

```regex
(?<=cm)-1
(?<=\d)(rd|th|st)
```

### **Subscript Values in Formulas**

```regex
(?<=CO)2|(?<=CH)4|(?<=SiO)2
```

### **No-Break Combo Rule**

```regex
(?<=cm)-1|.{15}$
```

---

# 🧩 **Keep Options (Not GREP Rules)**

Use Keep Options to reduce widows/orphans, especially at:

* New frames
* New columns
* New pages
