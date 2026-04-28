const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;

const uploadInput = document.getElementById("template-upload");
const logoUploadInput = document.getElementById("logo-upload");
const productOverlayInput = document.getElementById("product-overlay");
const fileInfo = document.getElementById("file-info");
const logoInfo = document.getElementById("logo-info");
const productInfo = document.getElementById("product-info");
const thumbList = document.getElementById("thumb-list");
const eventDateInput = document.getElementById("event-date");
const accountNameInput = document.getElementById("account-name");
const marketingNodeInput = document.getElementById("marketing-node");
const redPacketInput = document.getElementById("redpacket-start-time");
const hostName1Input = document.getElementById("host-name-1");
const hostName2Input = document.getElementById("host-name-2");
const generateThemeBtn = document.getElementById("generate-theme");
const newThemeBtn = document.getElementById("new-theme");
const generatedThemesDiv = document.getElementById("generated-themes");
const generateAiBgBtn = document.getElementById("generate-ai-bg");
const aiBgStatus = document.getElementById("ai-bg-status");
const downloadBtn = document.getElementById("download-btn");
const stage = document.getElementById("preview-stage");
const templateImage = document.getElementById("template-image");
const defaultBg = document.getElementById("default-bg");
const layerRoot = document.getElementById("layer-root");
const exportCanvas = document.getElementById("export-canvas");
const exportCtx = exportCanvas.getContext("2d");

const selectedLayerName = document.getElementById("selected-layer-name");
const fontSizeControl = document.getElementById("font-size-control");
const fontColorControl = document.getElementById("font-color-control");
const layerWidthControl = document.getElementById("layer-width-control");
const layerHeightControl = document.getElementById("layer-height-control");
const addTextLayerBtn = document.getElementById("add-text-layer");
const resetSelectedLayerBtn = document.getElementById("reset-selected-layer");
const deleteSelectedLayerBtn = document.getElementById("delete-selected-layer");

const state = {
  templates: [],
  selectedTemplate: 0,
  selectedTheme: "",
  themeOptions: [],
  themeBatch: 0,
  logo: null,
  productOverlay: null,
  selectedLayerId: null,
  layers: {
    account: createTextLayer("account", "PLUS会员精选", 58, 54, 360, 54, 28, "#ffffff", false, "账号名称"),
    date: createTextLayer("date", "", 58, 100, 360, 44, 24, "#ffffff", false, "活动日期"),
    title: createTextLayer("title", "点击左侧生成直播标题", 105, 210, 870, 156, 74, "#ff5a43", false, "直播标题"),
    redPacket: createTextLayer("redPacket", "红包雨时间待填写", 680, 1230, 300, 110, 46, "#ffffff", false, "红包雨时间"),
    host1: createTextLayer("host1", "主播1", 126, 1420, 360, 70, 42, "#ffffff", false, "主播1"),
    host2: createTextLayer("host2", "主播2", 594, 1420, 360, 70, 42, "#ffffff", false, "主播2"),
  },
};

const defaultPositions = JSON.parse(JSON.stringify(state.layers));

uploadInput.addEventListener("change", handleTemplateUpload);
logoUploadInput.addEventListener("change", handleLogoUpload);
productOverlayInput.addEventListener("change", handleProductUpload);
generateThemeBtn.addEventListener("click", () => generateThemes(false));
newThemeBtn.addEventListener("click", () => generateThemes(true));
generateAiBgBtn.addEventListener("click", generateAiBackground);
downloadBtn.addEventListener("click", downloadCanvas);
addTextLayerBtn.addEventListener("click", addCustomTextLayer);
resetSelectedLayerBtn.addEventListener("click", resetSelectedLayer);
deleteSelectedLayerBtn.addEventListener("click", deleteSelectedLayer);

[eventDateInput, accountNameInput, redPacketInput, hostName1Input, hostName2Input].forEach((input) => {
  input.addEventListener("input", syncInputLayers);
});

[fontSizeControl, fontColorControl, layerWidthControl, layerHeightControl].forEach((control) => {
  control.addEventListener("input", updateSelectedLayerFromControls);
});

window.addEventListener("resize", renderLayers);

document.addEventListener("pointerdown", (event) => {
  if (!stage.contains(event.target) && !event.target.closest(".editor-card")) {
    selectLayer(null);
  }
});

syncInputLayers();
renderThemeOptions();
renderPreviewBackground();
renderLayers();

function createTextLayer(id, text, x, y, w, h, fontSize, color, isCustom, label) {
  return {
    id,
    type: "text",
    label,
    text,
    x,
    y,
    w,
    h,
    fontSize,
    color,
    visible: true,
    isCustom,
  };
}

function createImageLayer(id, label, img, src, x, y, w, h, isCustom = false) {
  return {
    id,
    type: "image",
    label,
    img,
    src,
    x,
    y,
    w,
    h,
    visible: true,
    isCustom,
  };
}

function handleTemplateUpload(event) {
  const files = Array.from(event.target.files || []).slice(0, 3);
  if (!files.length) return;

  state.templates = [];
  fileInfo.textContent = `正在读取 ${files.length} 张文件...`;
  setAiBgStatus("模板图已选择，可点击“AI生成背景图”开始生成");

  let loadedCount = 0;
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        state.templates.push({
          name: file.name,
          src: readerEvent.target.result,
          image: img,
        });
        loadedCount += 1;
        if (loadedCount === files.length) {
          state.selectedTemplate = 0;
          fileInfo.textContent = `已选择 ${files.length} 张文件`;
          renderTemplateThumbs();
          renderPreviewBackground();
        }
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderTemplateThumbs() {
  thumbList.innerHTML = "";
  state.templates.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumb-item";
    button.dataset.index = index;
    if (index === state.selectedTemplate) {
      button.classList.add("active");
    }
    button.innerHTML = `<img src="${item.src}" alt="模板${index + 1}" />`;
    button.addEventListener("click", () => {
      state.selectedTemplate = index;
      renderTemplateThumbs();
      renderPreviewBackground();
    });
    thumbList.appendChild(button);
  });
}

function renderPreviewBackground() {
  const current = state.templates[state.selectedTemplate];
  if (current) {
    templateImage.src = current.src;
    templateImage.style.display = "block";
    defaultBg.style.display = "none";
  } else {
    templateImage.removeAttribute("src");
    templateImage.style.display = "none";
    defaultBg.style.display = "grid";
  }
}

function handleLogoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (readerEvent) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / Math.max(img.naturalHeight, 1);
      const width = Math.min(300, Math.max(170, 220 * ratio));
      const layer = createImageLayer("logo", "品牌 Logo", img, readerEvent.target.result, 64, 64, width, 130, false);
      state.logo = layer;
      state.layers.logo = layer;
      logoInfo.textContent = `已选择 Logo：${file.name}`;
      selectLayer("logo");
      renderLayers();
    };
    img.src = readerEvent.target.result;
  };
  reader.readAsDataURL(file);
}

function handleProductUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (readerEvent) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / Math.max(img.naturalHeight, 1);
      const layer = createImageLayer("product", "产品贴片", img, readerEvent.target.result, 660, 840, 300, Math.max(180, 300 / ratio), false);
      state.productOverlay = layer;
      state.layers.product = layer;
      productInfo.textContent = `已选择产品贴片：${file.name}`;
      selectLayer("product");
      renderLayers();
    };
    img.src = readerEvent.target.result;
  };
  reader.readAsDataURL(file);
}

function syncInputLayers() {
  const accountName = accountNameInput.value.trim() || "PLUS会员精选";
  state.layers.account.text = accountName;

  state.layers.date.text = eventDateInput.value ? formatDate(eventDateInput.value) : "";

  const redTime = redPacketInput.value ? `${redPacketInput.value} 红包雨开抢` : "红包雨时间待填写";
  state.layers.redPacket.text = redTime;

  state.layers.host1.text = hostName1Input.value.trim() || "主播1";
  state.layers.host2.text = hostName2Input.value.trim() || "主播2";

  renderLayers();
}

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) return dateValue;
  return `${month}.${day} 直播开启`;
}

function setAiBgStatus(text) {
  if (aiBgStatus) aiBgStatus.textContent = text;
}

async function generateAiBackground() {
  const templates = state.templates.map((item) => item.src).slice(0, 3);
  if (!templates.length) {
    alert("请先上传至少 1 张模板图");
    return;
  }

  const payload = {
    templates,
    accountName: accountNameInput.value.trim() || "PLUS会员精选",
    eventDate: eventDateInput.value || "",
    marketingNode: marketingNodeInput.value.trim() || "",
    redPacketTime: redPacketInput.value || "",
    host1: hostName1Input.value.trim() || "",
    host2: hostName2Input.value.trim() || "",
    selectedTheme: state.selectedTheme || state.layers.title.text || "",
  };

  try {
    generateAiBgBtn.disabled = true;
    generateAiBgBtn.textContent = "生成中...";
    setAiBgStatus("AI 正在参考模板风格生成全新的直播间背景图，请稍候...");

    const response = await fetch("/api/generate-background", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "生成失败");
    }
    if (!data.imageUrl) {
      throw new Error("未返回图片数据");
    }

    const img = new Image();
    img.onload = () => {
      state.templates.unshift({
        name: "AI生成背景图",
        src: data.imageUrl,
        image: img,
      });
      state.selectedTemplate = 0;
      renderTemplateThumbs();
      renderPreviewBackground();
      fileInfo.textContent = "已生成新的 AI 背景图";
      setAiBgStatus("生成完成，右侧预览区已更新为新的背景图");
    };
    img.src = data.imageUrl;
  } catch (error) {
    console.error(error);
    alert(`AI 生成失败：${error.message}`);
    setAiBgStatus("生成失败，请检查 Gemini API Key、模型可用性或稍后重试");
  } finally {
    generateAiBgBtn.disabled = false;
    generateAiBgBtn.textContent = "AI生成背景图";
  }
}

function generateThemes(reshuffle) {
  const node = marketingNodeInput.value.trim();
  if (!node) {
    alert("请先输入营销节点");
    return;
  }

  state.themeBatch = reshuffle ? state.themeBatch + 1 : 0;
  state.themeOptions = getCreativeThemes(node, state.themeBatch);
  state.selectedTheme = state.themeOptions[0] || "";
  state.layers.title.text = state.selectedTheme || "点击左侧生成直播标题";
  renderThemeOptions();
  renderLayers();
  selectLayer("title");
}

function getCreativeThemes(node, batch) {
  const cleanNode = node.trim();
  const isMother = /母亲节|妈妈|母亲|宠妈|妈咪/.test(cleanNode);
  const is520 = /520|表白|告白|爱/.test(cleanNode);
  const is618 = /618|年中|大促/.test(cleanNode);

  let pool;
  if (isMother) {
    pool = [
      "妈上有惊喜，PLUS宠爱提前购",
      "宠妈不手软，PLUS好礼抢先囤",
      "把爱价给妈妈，PLUS福利别错过",
      "妈妈值得更PLUS一点",
      "爱在加码，宠妈到家",
      "给妈妈的礼物，PLUS先安排",
      "宠爱不等人，福利先开抢",
      "妈妈的快乐，PLUS承包了",
      "宠妈有一套，PLUS帮你挑",
      "把省心送给妈妈",
      "为妈妈加点甜，也加点省",
      "爱要趁早，福利趁现在",
    ];
  } else if (is520) {
    pool = [
      "爱意加码，PLUS帮你省到位",
      "520心动购，福利不止一点点",
      "把喜欢装进购物车",
      "PLUS替你把爱安排好",
      "心动不用等，福利先告白",
      "甜蜜加一档，价格减一档",
      "爱在今天，省在PLUS",
      "把浪漫买成刚刚好",
    ];
  } else if (is618) {
    pool = [
      "618先开抢，PLUS福利加满",
      "年中囤货局，PLUS先上车",
      "不等大促，先享底价",
      "PLUS年中福利局",
      "好价先到，福利加码",
      "618抢先购，省心更省钱",
      "囤货正当时，PLUS先安排",
      "年中焕新，PLUS开场",
    ];
  } else {
    pool = [
      `${cleanNode}福利开场，PLUS抢先购`,
      `${cleanNode}好价局，PLUS先安排`,
      `${cleanNode}加码宠粉，PLUS会员专享`,
      `${cleanNode}不空手，福利带回家`,
      `${cleanNode}先享会，PLUS有惊喜`,
      `${cleanNode}省心购，PLUS福利到位`,
      `${cleanNode}限定场，福利正在加载`,
      `${cleanNode}焕新局，PLUS帮你挑`,
      `${cleanNode}好物局，价格很能打`,
      `${cleanNode}快乐购，PLUS更省心`,
      `${cleanNode}福利上新，PLUS先冲`,
      `${cleanNode}限时上车，PLUS别错过`,
    ];
  }

  const start = (batch * 4) % pool.length;
  const options = [];
  for (let i = 0; i < 4; i += 1) {
    options.push(pool[(start + i) % pool.length]);
  }
  return options;
}

function renderThemeOptions() {
  generatedThemesDiv.innerHTML = "";
  if (!state.themeOptions.length) {
    generatedThemesDiv.innerHTML = `<div class="theme-card"><div class="theme-index">?</div><div>输入营销节点后，点击“生成直播标题”</div></div>`;
    return;
  }

  state.themeOptions.forEach((theme, index) => {
    const themeCard = document.createElement("button");
    themeCard.type = "button";
    themeCard.className = "theme-card";
    themeCard.classList.toggle("active", theme === state.selectedTheme);
    themeCard.innerHTML = `<div class="theme-index">${index + 1}</div><div>${theme}</div>`;
    themeCard.addEventListener("click", () => {
      state.selectedTheme = theme;
      state.layers.title.text = theme;
      renderThemeOptions();
      renderLayers();
      selectLayer("title");
    });
    generatedThemesDiv.appendChild(themeCard);
  });
}

function addCustomTextLayer() {
  const id = `custom-${Date.now()}`;
  state.layers[id] = createTextLayer(id, "双击编辑文字", 230, 620, 620, 120, 56, "#ffffff", true, "自定义文字");
  selectLayer(id);
  renderLayers();
}

function renderLayers() {
  layerRoot.innerHTML = "";
  const scale = getScale();
  Object.values(state.layers).forEach((layer) => {
    if (!layer || layer.visible === false) return;

    const el = document.createElement("div");
    el.className = "edit-layer";
    el.dataset.layerId = layer.id;
    el.classList.toggle("selected", layer.id === state.selectedLayerId);
    el.style.left = `${layer.x * scale}px`;
    el.style.top = `${layer.y * scale}px`;
    el.style.width = `${layer.w * scale}px`;
    el.style.height = `${layer.h * scale}px`;

    if (layer.type === "text") {
      const content = document.createElement("div");
      content.className = "text-layer-content";
      content.contentEditable = "true";
      content.spellcheck = false;
      content.textContent = layer.text;
      content.style.setProperty("--layer-font-size", `${layer.fontSize * scale}px`);
      content.style.setProperty("--layer-color", layer.color || "#ffffff");
      content.addEventListener("input", () => {
        layer.text = content.textContent.trim() || " ";
        syncInputsFromLayer(layer);
      });
      content.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        selectLayer(layer.id);
        content.focus();
        selectAllText(content);
      });
      el.appendChild(content);
    } else if (layer.type === "image") {
      const img = document.createElement("img");
      img.className = "image-layer-content";
      img.src = layer.src;
      img.alt = layer.label || "图片图层";
      el.appendChild(img);
    }

    const handle = document.createElement("span");
    handle.className = "resize-handle";
    handle.title = "拖拽缩放";
    handle.addEventListener("pointerdown", (event) => startResize(event, layer.id));
    el.appendChild(handle);

    el.addEventListener("pointerdown", (event) => startMove(event, layer.id));
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      selectLayer(layer.id);
    });

    layerRoot.appendChild(el);
  });
  updateEditorControls();
}

function getScale() {
  return stage.clientWidth / DESIGN_WIDTH;
}

function startMove(event, layerId) {
  if (event.target.classList.contains("resize-handle")) return;
  const layer = state.layers[layerId];
  if (!layer) return;

  selectLayer(layerId);
  const scale = getScale();
  const startX = event.clientX;
  const startY = event.clientY;
  const originX = layer.x;
  const originY = layer.y;
  let moved = false;

  const onPointerMove = (moveEvent) => {
    const dx = (moveEvent.clientX - startX) / scale;
    const dy = (moveEvent.clientY - startY) / scale;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    layer.x = clamp(originX + dx, 0, DESIGN_WIDTH - layer.w);
    layer.y = clamp(originY + dy, 0, DESIGN_HEIGHT - layer.h);
    updateLayerElement(layer);
    updateEditorControls();
  };

  const onPointerUp = (upEvent) => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    if (!moved && layer.type === "text") {
      const content = layerRoot.querySelector(`[data-layer-id="${CSS.escape(layer.id)}"] .text-layer-content`);
      if (content) content.focus();
    }
  };

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  event.preventDefault();
  event.stopPropagation();
}

function startResize(event, layerId) {
  const layer = state.layers[layerId];
  if (!layer) return;

  selectLayer(layerId);
  const scale = getScale();
  const startX = event.clientX;
  const startY = event.clientY;
  const originW = layer.w;
  const originH = layer.h;
  const aspect = originW / Math.max(originH, 1);

  const onPointerMove = (moveEvent) => {
    const dx = (moveEvent.clientX - startX) / scale;
    const dy = (moveEvent.clientY - startY) / scale;
    let newW = clamp(originW + dx, 40, DESIGN_WIDTH - layer.x);
    let newH = clamp(originH + dy, 24, DESIGN_HEIGHT - layer.y);

    if (layer.type === "image" && moveEvent.shiftKey) {
      newH = newW / aspect;
    }

    layer.w = newW;
    layer.h = newH;
    updateLayerElement(layer);
    updateEditorControls();
  };

  const onPointerUp = () => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  event.preventDefault();
  event.stopPropagation();
}

function updateLayerElement(layer) {
  const scale = getScale();
  const el = layerRoot.querySelector(`[data-layer-id="${CSS.escape(layer.id)}"]`);
  if (!el) return;
  el.style.left = `${layer.x * scale}px`;
  el.style.top = `${layer.y * scale}px`;
  el.style.width = `${layer.w * scale}px`;
  el.style.height = `${layer.h * scale}px`;
  const content = el.querySelector(".text-layer-content");
  if (content) {
    content.style.setProperty("--layer-font-size", `${layer.fontSize * scale}px`);
    content.style.setProperty("--layer-color", layer.color || "#ffffff");
  }
}

function selectLayer(layerId) {
  state.selectedLayerId = layerId;
  layerRoot.querySelectorAll(".edit-layer").forEach((el) => {
    el.classList.toggle("selected", el.dataset.layerId === layerId);
  });
  updateEditorControls();
}

function updateEditorControls() {
  const layer = state.layers[state.selectedLayerId];
  const hasLayer = Boolean(layer);
  if (!hasLayer) {
    selectedLayerName.textContent = "请先点击右侧预览区中的文字或图片";
    [fontSizeControl, fontColorControl, layerWidthControl, layerHeightControl, resetSelectedLayerBtn, deleteSelectedLayerBtn].forEach((el) => {
      el.disabled = true;
    });
    return;
  }

  selectedLayerName.textContent = `当前选中：${layer.label || layer.id}`;
  [layerWidthControl, layerHeightControl, resetSelectedLayerBtn, deleteSelectedLayerBtn].forEach((el) => {
    el.disabled = false;
  });
  layerWidthControl.value = Math.round(layer.w);
  layerHeightControl.value = Math.round(layer.h);

  if (layer.type === "text") {
    fontSizeControl.disabled = false;
    fontColorControl.disabled = false;
    fontSizeControl.value = Math.round(layer.fontSize || 48);
    fontColorControl.value = layer.color || "#ffffff";
  } else {
    fontSizeControl.disabled = true;
    fontColorControl.disabled = true;
  }
}

function updateSelectedLayerFromControls() {
  const layer = state.layers[state.selectedLayerId];
  if (!layer) return;

  layer.w = clamp(Number(layerWidthControl.value) || layer.w, 40, DESIGN_WIDTH - layer.x);
  layer.h = clamp(Number(layerHeightControl.value) || layer.h, 20, DESIGN_HEIGHT - layer.y);

  if (layer.type === "text") {
    layer.fontSize = clamp(Number(fontSizeControl.value) || layer.fontSize, 12, 220);
    layer.color = fontColorControl.value || layer.color;
  }

  updateLayerElement(layer);
}

function resetSelectedLayer() {
  const layer = state.layers[state.selectedLayerId];
  if (!layer) return;

  const fallback = defaultPositions[layer.id];
  if (fallback) {
    layer.x = fallback.x;
    layer.y = fallback.y;
    layer.w = fallback.w;
    layer.h = fallback.h;
    if (layer.type === "text") {
      layer.fontSize = fallback.fontSize;
      layer.color = fallback.color;
    }
  } else {
    layer.x = 220;
    layer.y = 620;
    layer.w = layer.type === "text" ? 620 : 260;
    layer.h = layer.type === "text" ? 120 : 260;
  }
  renderLayers();
}

function deleteSelectedLayer() {
  const layer = state.layers[state.selectedLayerId];
  if (!layer) return;

  if (["account", "date", "title", "redPacket", "host1", "host2"].includes(layer.id)) {
    alert("系统信息层建议保留，可直接双击改文案或拖到其他位置；如不想展示，可将文字内容清空。");
    return;
  }

  delete state.layers[layer.id];
  if (layer.id === "logo") {
    state.logo = null;
    logoInfo.textContent = "Logo 已从预览区删除，可重新上传";
  }
  if (layer.id === "product") {
    state.productOverlay = null;
    productInfo.textContent = "产品贴片已从预览区删除，可重新上传";
  }
  selectLayer(null);
  renderLayers();
}

function syncInputsFromLayer(layer) {
  if (!layer || layer.type !== "text") return;
  if (layer.id === "account") accountNameInput.value = layer.text;
  if (layer.id === "title") state.selectedTheme = layer.text;
  if (layer.id === "host1" && layer.text !== "主播1") hostName1Input.value = layer.text;
  if (layer.id === "host2" && layer.text !== "主播2") hostName2Input.value = layer.text;
  renderThemeOptions();
}

function selectAllText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function downloadCanvas() {
  renderExportCanvas();
  const link = document.createElement("a");
  link.download = `PLUS直播间视觉图_${Date.now()}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

function renderExportCanvas() {
  exportCtx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  const current = state.templates[state.selectedTemplate];
  if (current) {
    drawCoverImage(exportCtx, current.image, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  } else {
    drawDefaultBackground(exportCtx);
  }

  Object.values(state.layers).forEach((layer) => {
    if (!layer || layer.visible === false) return;
    if (layer.type === "image") {
      exportCtx.save();
      exportCtx.shadowColor = "rgba(0,0,0,0.18)";
      exportCtx.shadowBlur = 24;
      exportCtx.shadowOffsetY = 10;
      exportCtx.drawImage(layer.img, layer.x, layer.y, layer.w, layer.h);
      exportCtx.restore();
    } else if (layer.type === "text") {
      drawTextLayer(exportCtx, layer);
    }
  });
}

function drawCoverImage(ctx, image, x, y, w, h) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;
  if (imageRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function drawDefaultBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, DESIGN_HEIGHT);
  gradient.addColorStop(0, "#fff1e6");
  gradient.addColorStop(0.52, "#ffe5ef");
  gradient.addColorStop(1, "#ffd7c2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.46)";
  ctx.beginPath();
  ctx.ellipse(530, 310, 420, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "900 86px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ff6234";
  ctx.fillText("PLUS会员精选", DESIGN_WIDTH / 2, 820);
  ctx.font = "400 38px sans-serif";
  ctx.fillStyle = "#965d55";
  ctx.fillText("上传模板后自动替换背景", DESIGN_WIDTH / 2, 890);
}

function drawTextLayer(ctx, layer) {
  ctx.save();
  ctx.font = `900 ${layer.fontSize}px sans-serif`;
  ctx.fillStyle = layer.color || "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(108, 39, 22, 0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 5;

  const lines = wrapText(ctx, layer.text || " ", layer.w - 16);
  const lineHeight = layer.fontSize * 1.08;
  const totalHeight = lines.length * lineHeight;
  const startY = layer.y + layer.h / 2 - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, layer.x + layer.w / 2, startY + index * lineHeight);
  });
  ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
  const source = String(text).split("\n");
  const lines = [];
  source.forEach((paragraph) => {
    let current = "";
    Array.from(paragraph).forEach((char) => {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    });
    lines.push(current || " ");
  });
  return lines;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
