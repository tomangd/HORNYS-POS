function doGet() {
  return HtmlService
    .createHtmlOutput(getCaisseHTML())
    .setTitle(CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setFaviconUrl("https://drive.google.com/uc?id=1ClAizPe1rDZN0FHBXy9k_f26Kxe0YXjq&export=download&format=png")
}