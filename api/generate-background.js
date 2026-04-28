function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function dataUrlToInlinePart(dataUrl) {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  return {
    inline_data: {
      mime_type: match[1],
      data: match[2],
    },
  };
}

async function callGemini(model, apiKey, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `Gemini 请求失败：${response.status}`;
    throw new Error(message);
  }
  return data;
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text).filter(Boolean).join("\n").trim();
}

function extractImageBase64(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) return inline.data;
  }
  return null;
}

async function styleSummary(apiKey, templates) {
  const imageParts = templates.map(dataUrlToInlinePart).filter(Boolean);
  const body = {
    contents: [
      {
        parts: [
          {
            text:
              "请分析这些电商直播模板图的视觉风格，并给出一段简洁总结。请重点总结：主色调、构图结构、装饰元素、整体氛围，以及适合延续到直播背景图中的设计建议。要求：不要照搬图中的具体人物、商品、文案，只输出可用于图像生成的风格总结。",
          },
          ...imageParts,
        ],
      },
    ],
  };

  const models = ["gemini-2.0-flash", "gemini-2.5-flash"];
  let lastError;
  for (const model of models) {
    try {
      const data = await callGemini(model, apiKey, body);
      const text = extractText(data);
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError) throw lastError;
  return "电商直播视觉，配色柔和，版式清晰，适合做直播间背景图。";
}

async function generateImage(apiKey, prompt) {
  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const models = [
    "gemini-2.0-flash-preview-image-generation",
    "gemini-2.5-flash-image-preview",
  ];

  let lastError;
  for (const model of models) {
    try {
      const data = await callGemini(model, apiKey, body);
      const base64 = extractImageBase64(data);
      if (base64) return base64;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Gemini 未返回图片数据");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "仅支持 POST 请求" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(res, 500, { error: "未配置 GEMINI_API_KEY，请先到 Vercel 环境变量中配置。" });
  }

  try {
    const {
      templates = [],
      accountName = "PLUS会员精选",
      eventDate = "",
      marketingNode = "",
      redPacketTime = "",
      host1 = "",
      host2 = "",
      selectedTheme = "",
    } = req.body || {};

    if (!Array.isArray(templates) || !templates.length) {
      return json(res, 400, { error: "请先上传至少 1 张模板图" });
    }

    const summary = await styleSummary(apiKey, templates.slice(0, 3));

    const prompt = `请生成一张适用于电商直播间的竖版背景图，整体比例接近 9:16。
账号名称：${accountName}
活动日期：${eventDate || "待定"}
营销节点：${marketingNode || "平台促销活动"}
标题方向：${selectedTheme || marketingNode || "直播福利开场"}
红包雨时间：${redPacketTime || "待定"}
主播：${host1 || "主播1"}、${host2 || "主播2"}
参考风格总结：${summary}

生成要求：
1. 必须生成一张全新的直播间背景图，不能直接复制参考模板中的人物、商品、文案或排版。
2. 只参考其色彩氛围、直播电商视觉感、装饰语言和版式节奏。
3. 画面要精致、干净、轻促销风，不要太杂乱。
4. 请自然预留这些区域：顶部 Logo/账号区域、上中部标题区域、中部主视觉区域、侧边福利信息区、底部桌面或留白区。
5. 背景图要方便后续叠加标题、红包雨时间、主播名、品牌 Logo、产品贴片。
6. 不要出现明确人物特写，不要写死复杂的促销文案。
7. 输出高质量完整背景图。`;

    const imageBase64 = await generateImage(apiKey, prompt);
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return json(res, 200, { imageUrl, styleSummary: summary });
  } catch (error) {
    console.error("[generate-background]", error);
    return json(res, 500, { error: error.message || "Gemini 生图失败" });
  }
};
