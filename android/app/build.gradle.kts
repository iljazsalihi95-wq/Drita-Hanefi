plugins { id("com.android.application") }

android {
    namespace = "com.dritahanefi.app"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.dritahanefi.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 4
        versionName = "0.2.2-preview"
    }
}

val webRoot = rootProject.projectDir.parentFile
val bundledSite = layout.projectDirectory.dir("src/main/assets/site")

val syncWebAssets by tasks.registering(Sync::class) {
    from(webRoot) {
        include("index.html")
        include("assets/**")
        include("modules/**")
        include("admin/**")
        exclude("**/.DS_Store")
    }
    into(bundledSite)
}

tasks.named("preBuild").configure {
    dependsOn(syncWebAssets)
}
