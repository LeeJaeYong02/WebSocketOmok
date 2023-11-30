moduleClient = {};

// 새로고침 감지
moduleClient.refreshPerceive = function(callMethod) {
    const entries = performance.getEntriesByType("navigation")[0];
    if (entries.type === "reload") {
        callMethod();
    }
}