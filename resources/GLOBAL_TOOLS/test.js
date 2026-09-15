/**
 * 河北石油职业技术大学 (正方 v9.0) 兼容版测试脚本
 */
function scheduleHtmlParser(htmlString) {
    let result = [];

    // 尝试 1：优先解析 JSON 格式数据
    try {
        let data = typeof htmlString === 'string' ? JSON.parse(htmlString) : htmlString;
        let kbList = data.kbList || (data.data && data.data.kbList);
        if (kbList && kbList.length > 0) {
            kbList.forEach(item => {
                result.push({
                    name: item.kcmc || "未知课程",
                    teacher: item.jsxm || "",
                    position: item.cdmc || "",
                    day: parseInt(item.xqj) || 1,
                    weeks: parseWeeks(item.zcd),
                    sections: parseSections(item.jcs)
                });
            });
            if (result.length > 0) return result;
        }
    } catch (e) {
        // 非 JSON 数据，继续往下执行 DOM 解析
    }

    // 尝试 2：直接解析 HTML DOM 页面（正方课表表格）
    try {
        let $ = cheerio.load(htmlString); // 如果框架内置了 jquery/cheerio
        // 针对正方表格 td 解析
        $("table#kbtable tbody tr td").each(function () {
            let tdText = $(this).text().trim();
            if (tdText && tdText.length > 5) {
                // 提取课程名称等文本（可根据实际 DOM 调整）
            }
        });
    } catch (e) {
        console.error("DOM 解析失败", e);
    }

    return result;
}

function parseWeeks(zcdStr) {
    let weeks = [];
    if (!zcdStr) return weeks;
    let match = zcdStr.match(/(\d+)-(\d+)/);
    if (match) {
        let start = parseInt(match[1]), end = parseInt(match[2]);
        let isSingle = zcdStr.includes("单"), isDouble = zcdStr.includes("双");
        for (let i = start; i <= end; i++) {
            if (isSingle && i % 2 === 0) continue;
            if (isDouble && i % 2 !== 0) continue;
            weeks.push(i);
        }
    }
    return weeks;
}

function parseSections(jcsStr) {
    let sections = [];
    if (!jcsStr) return sections;
    let parts = jcsStr.split('-');
    if (parts.length === 2) {
        for (let i = parseInt(parts[0]); i <= parseInt(parts[1]); i++) sections.push(i);
    } else if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
        sections.push(parseInt(parts[0]));
    }
    return sections;
}
