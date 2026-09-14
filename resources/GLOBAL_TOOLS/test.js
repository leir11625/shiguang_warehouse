/**
 * 河北石油职业技术大学 正方教务系统 (v9.0) 课表解析脚本
 * 适用于 shiguangschedule 适配器框架
 */

function scheduleHtmlParser(htmlString) {
    let result = [];
    
    try {
        let data = JSON.parse(htmlString);
        let kbList = data.kbList || [];

        kbList.forEach(item => {
            let name = item.kcmc || "未知课程";
            let teacher = item.jsxm || "";
            let position = item.cdmc || "";
            let day = parseInt(item.xqj) || 1; // 星期几 (1-7)

            // 解析周次 (例如: "1-16周", "1-16周(单)", "3,5,7周")
            let weeks = parseWeeks(item.zcd);

            // 解析节次 (例如: "1-2" -> [1, 2], "3-4" -> [3, 4])
            let sections = parseSections(item.jcs);

            if (weeks.length > 0 && sections.length > 0) {
                result.push({
                    name: name,
                    teacher: teacher,
                    position: position,
                    day: day,
                    weeks: weeks,
                    sections: sections
                });
            }
        });

    } catch (e) {
        console.error("HEBPU 课表解析失败：数据非标准 JSON 格式或解析异常", e);
    }

    return result;
}

/**
 * 辅助函数：解析周次字符串
 * @param {string} zcdStr - 如 "1-16周", "1-16周(单)", "1-16周(双)", "2,4,6周"
 * @returns {number[]} 周次数字数组
 */
function parseWeeks(zcdStr) {
    let weeks = [];
    if (!zcdStr) return weeks;

    // 按逗号分割多段周次（如 "1-8周,10-16周"）
    let segments = zcdStr.split(',');

    segments.forEach(seg => {
        let isSingle = seg.includes("单");
        let isDouble = seg.includes("双");

        // 匹配数字范围，例如 1-16
        let rangeMatch = seg.match(/(\d+)-(\d+)/);
        if (rangeMatch) {
            let start = parseInt(rangeMatch[1]);
            let end = parseInt(rangeMatch[2]);

            for (let i = start; i <= end; i++) {
                if (isSingle && i % 2 === 0) continue; // 单周跳过偶数
                if (isDouble && i % 2 !== 0) continue; // 双周跳过奇数
                weeks.push(i);
            }
        } else {
            // 单个周次匹配，例如 "5周"
            let singleMatch = seg.match(/(\d+)/);
            if (singleMatch) {
                weeks.push(parseInt(singleMatch[1]));
            }
        }
    });

    return weeks;
}

/**
 * 辅助函数：解析节次字符串
 * @param {string} jcsStr - 如 "1-2", "3-4", "5"
 * @returns {number[]} 节次数字数组
 */
function parseSections(jcsStr) {
    let sections = [];
    if (!jcsStr) return sections;

    let parts = jcsStr.split('-');
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
