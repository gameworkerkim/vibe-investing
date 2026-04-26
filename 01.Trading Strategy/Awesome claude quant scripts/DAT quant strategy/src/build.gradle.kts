// build.gradle.kts
// DAT Quant Strategy — Kotlin/JVM 빌드 스크립트
//
// 사용법:
//   gradle init (프로젝트 초기화 시)
//   gradle run

plugins {
    kotlin("jvm") version "1.9.22"
    application
}

group = "com.gameworkerkim.vibeinvesting.dat"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // 데이터 직렬화
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.16.0")

    // 코루틴 (비동기 HTTP 호출)
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    // HTTP 클라이언트 (Yahoo Finance API 호출)
    implementation("io.ktor:ktor-client-core:2.3.7")
    implementation("io.ktor:ktor-client-cio:2.3.7")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.7")
    implementation("io.ktor:ktor-serialization-jackson:2.3.7")

    // 통계 분석 (Pearson 상관관계, t-distribution)
    implementation("org.apache.commons:commons-math3:3.6.1")

    // 날짜/시간 처리
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")

    // 로깅 (선택)
    implementation("org.slf4j:slf4j-simple:2.0.9")

    // 테스트
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.1")
}

application {
    mainClass.set("com.gameworkerkim.vibeinvesting.dat.DatZScoreStrategyKt")
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(17)
}
