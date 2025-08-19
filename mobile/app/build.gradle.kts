import java.util.Properties
import java.io.FileInputStream

// ... (возможно, другие import'ы)

val secretsFile = rootProject.file("app/secrets.properties") // Путь относительно корня проекта
val secrets = Properties()
if (secretsFile.exists()) {
    secrets.load(FileInputStream(secretsFile))
} else {
    println("Warning: secrets.properties file not found. Using default or empty values.")
    // Ты можешь определить значения по умолчанию здесь, если это необходимо
    // secrets.setProperty("STRIPE_PUBLISHABLE_KEY", "\"default_if_not_found\"")
}

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
    id("com.google.android.libraries.mapsplatform.secrets-gradle-plugin")
}

android {
    namespace = "com.lapcevichme.templates"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.lapcevichme.templates"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        val stripePublishableKey = secrets.getProperty("STRIPE_PUBLISHABLE_KEY", "\"YOUR_DEFAULT_OR_MISSING_KEY\"")
        buildConfigField("String", "STRIPE_PUBLISHABLE_KEY", stripePublishableKey)
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    flavorDimensions += "environment"

    productFlavors {
        create("dev") {
            dimension = "environment"
            applicationIdSuffix = ".dev"
            buildConfigField("String", "BASE_URL", "\"https://backend-auto-spare-parts.fly.dev/\"")
        }

        create("prod") {
            dimension = "environment"
            buildConfigField("String", "BASE_URL", "\"https://backend-auto-spare-parts.fly.dev/\"")
        }
    }
}

kotlin {
    jvmToolchain(11)
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.runtime.android)
    implementation(libs.androidx.navigation.compose.android)
    implementation(libs.play.services.location)
    implementation(libs.androidx.appcompat)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.coil.compose)
    // DI
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)
    // WEB
    implementation(libs.retrofit.core)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.gson)
    implementation(libs.okhttp.core)
    implementation(libs.okhttp.logging.interceptor)
    // OSM
    implementation(libs.osmdroid)
    // STRIPE
    implementation("com.stripe:stripe-android:21.23.1")
    implementation("com.stripe:connect:21.23.1")
    // SIDE LIBS FROM GITHUB
    implementation(libs.wheelpickercompose)
}