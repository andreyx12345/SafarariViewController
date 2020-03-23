/** @module Android */
var path = require("path");
var newrelic = require("../newrelic");

/**
 * @desc Android object to add New Relic to the gradle tasks.
 * @type {{gradleBuildPath: string,
 * pluginConfig: (*),
 * nrTag: string,
 * slurpRootLevelGradle: module.exports.slurpRootLevelGradle,
 * writeRootLevelGradle: module.exports.writeRootLevelGradle,
 * injectAgentPlugin: module.exports.injectAgentPlugin,
 * injectNewRelicProperties: module.exports.injectNewRelicProperties,
 * removeAgentPlugin: module.exports.removeAgentPlugin}}
 */
module.exports = {

  /**
   * gradle build paths
   */
  gradleBuildPath: path.join("platforms", "android", "app", "build.gradle"),

  /**
   * Agent build extension
   */
  nrTag: "\n// NEWRELIC ADDED\n"
  + "dependencies {\n\t\implementation 'androidx.browser:browser:1.2.0'\n}\n"
    + "// NEWRELIC ADDED\n",

  /**
   * NewRelic Gradle plugin invocation
   */
  nrGradlePluginTag: "apply plugin: 'newrelic'\n",

  /**
   * Helper method to read the root gradle file.
   * @returns {String} Root Gradle File
   */
  slurpRootLevelGradle: function () {
    return newrelic.slurpFile(this.gradleBuildPath);
  },

  /**
   * Write contents to the gradle build path
   * @param {String} contents - The contents to be written to the gradle file.
   */
  writeRootLevelGradle: function (contents) {
    newrelic.writeFile(this.gradleBuildPath, contents);
  },

  /**
   *  Inject the New Relic agent into root gradle
   */
  injectAgentPlugin: function () {
    var buildGradle = this.slurpRootLevelGradle() + this.nrTag;
    this.writeRootLevelGradle(buildGradle)
  },

  /**
   * Inject the New Relic App Token into the NewRelic Properties file.
   */
  injectNewRelicProperties: function () {
    var appToken = this.pluginConfig.appToken;
    var newRelicPropertiesPath = path.join(".", "newrelic.properties");
    var newRelicProperties = "com.newrelic.application_token=" + appToken + "\n";
    newrelic.writeFile(newRelicPropertiesPath, newRelicProperties);
  },

  /**
   * Remove New Relic from gradle.
   */
  removeAgentPlugin: function () {
    var buildScript = this.slurpRootLevelGradle();
    this.writeRootLevelGradle(buildScript.replace(/\n\/\/ NEWRELIC ADDED[\s\S]*\/\/ NEWRELIC ADDED\n/, ""));
  },

  /**
   * Return {boolean} - if this platform exists and has been configured with an application token
   */
  isPlatformConfigured: function() {
    var config = newrelic.getAndroidConfig();
    return newrelic.isPlatformConfigured(config);
  },

};