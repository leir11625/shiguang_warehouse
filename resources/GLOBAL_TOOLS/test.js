// 通用正方教务系统 (v9.0) 适配脚本

function parseWeeks(weekStr) {
    if (!weekStr) return [];
    let weeks = [];
    let weekRanges = weekStr.split(',');
    
    weekRanges.forEach(range => {
        let isSingle = range.includes('(单)');
        let isDouble = range.includes('(双)');
        let match = range.match(/(\d+)-(\d+)/);
        
        if (match) {
            let start = parseInt(match[1]);
            let end = parseInt(match[2]);
            for (let i = start; i <= end; i++) {
                if (isSingle && i % 2 === 0) continue;
                if (isDouble && i % 2 !== 0) continue;
                weeks.push(i);
            }
        } else {
            let singleMatch = range.match(/(\d+)/);
            if (singleMatch) {
                weeks.push(parseInt(singleMatch[1]));
            }
        }
    });
    
    return [...new Set(weeks)].sort((a, b) => a - b);
}

function parseSections(sectionStr) {
    let sections = [];
    if (!sectionStr) return sections;
    
    let parts = sectionStr.split('-');
    if (parts.length === 2) {
        let start = parseInt(parts[0]);
        let end = parseInt(parts[1]);
        for (let i = start; i <= end; i++) {
            sections.push(i);
        }
    } else if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
        sections.push(parseInt(parts[0]));
    }
    
    return sections;
}

function scheduleHtmlParser(htmlString) {
    let result = [];
    let jsonData = null;

    // 1. 尝试直接解析 JSON 格式
    try {
        jsonData = typeof htmlString === 'string' ? JSON.parse(htmlString) : htmlString;
    } catch (e) {
        // 如果 htmlString 包含 HTML 包装，尝试正则提取 JSON
        let match = htmlString.match(/var\ |let\ |const\ )?kbList\s*=\s*(\[\{.*?\}\]);/s) || htmlString.match(/(\[\{"cdmc".*?\}\])/s);
        if (match && match[1]) {
            try {
                jsonData = { kbList: JSON.parse(match[1]) };
            } catch (err) {}
        }
    }

    // 2. 提取 JSON 中的 kbList 数据
    if (jsonData) {
        let list = jsonData.kbList || (jsonData.data && jsonData.data.kbList);
        if (Array.isArray(list) && list.length > 0) {
            list.forEach(item => {
                let name = item.kcmc || item.kcmc_mc || "";
                let teacher = item.xm || item.jsxm || "";
                let position = item.cdmc || item.cdmc_mc || "";
                let day = parseInt(item.xqj || item.xqj_mc) || 1;
                let weeks = parseWeeks(item.zcd || item.zcd_mc || "");
                let sections = parseSections(item.jcs || item.jcs_mc || "");

                if (name && weeks.length > 0 && sections.length > 0) {
                    result.push({
                        name: name.trim(),
                        teacher: teacher.trim(),
                        position: position.trim(),
                        day: day,
                        weeks: weeks,
                        sections: sections
                    });
                }
            });
            return result;
        }
    }

    // 3. 兜底方案：解析标准正方 kbtable DOM 表格
    try {
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlString, 'text/html');
        let tds = doc.querySelectorAll('table#kbtable td');

        tds.forEach(td => {
            let text = td.textContent || "";
            if (text.trim().length > 5) {
                let day = parseInt(td.getAttribute('xq')) || 1;
                let jcs = td.getAttribute('jcs') || "";
                let sections = parseSections(jcs);

                // 正方表格文本拆分
                let lines = text.split('\n').map(s => s.trim()).filter(Boolean);
                if (lines.length >= 2) {
                    result.push({
                        name: lines[0],
                        teacher: lines[1] || "",
                        position: lines[3] || lines[2] || "",
                        day: day,
                        weeks: parseWeeks(lines[2] || ""),
                        sections: sections
                    });
                }
            }
        });
    } catch (e) {}

    return result;
}

