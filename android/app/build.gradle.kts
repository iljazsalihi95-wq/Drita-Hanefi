plugins { id("com.android.application") }

android {
    namespace = "com.dritahanefi.app"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.dritahanefi.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 10
        versionName = "0.3.5-native-assets"
    }

    // The native shell loads the real repository modules from
    // file:///android_asset/site/... . Keep one source of truth: the root web app.
    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/dritaAssets"))
}

val syncDritaWebAssets by tasks.registering(Copy::class) {
    into(layout.buildDirectory.dir("generated/dritaAssets/site"))
    from("../../..") {
        include("index.html")
        include("modules/**")
        include("admin/**")
        include("assets/**")
        include("data/**")
        exclude("**/Code.gs")
    }
}

tasks.named("preBuild").configure {
    dependsOn(syncDritaWebAssets)
}
