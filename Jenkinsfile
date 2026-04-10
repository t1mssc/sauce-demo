pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        CI      = 'true'
        NODE_ENV = 'ci'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                git branch: 'main', url: 'https://github.com/t1mssc/sauce-demo.git'
            }
        }

        stage('Install Dependencies (if needed outside Docker)') {
            steps {
                script {
                    if (isUnix()) {
                        sh './install_dependencies.sh'
                    } else {
                        bat 'install_dependencies.bat'
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker build -t playwright-local .'
                    } else {
                        bat 'docker build -t playwright-local .'
                    }
                }
            }
        }

        stage('Run Playwright Tests inside Docker Container') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker run --rm -v $WORKSPACE/playwright-report:/app/playwright-report -v $WORKSPACE/allure-results:/app/allure-results playwright-local npm run playwright:test'
                    } else {
                        bat 'docker run --rm -v "%WORKSPACE%\\playwright-report:/app/playwright-report" -v "%WORKSPACE%\\allure-results:/app/allure-results" playwright-local npm run playwright:test'
                    }
                }
            }
        }
    }
}

    post {
        always {
            script {
                if (isUnix()) {
                    sh 'ls -lR allure-results || true'
                    sh 'ls -lR allure-report || true'
                } else {
                    bat 'dir allure-results /s || echo No allure-results directory'
                    bat 'dir allure-report /s || echo No allure-report directory'
                }
            }
            allure([
            includeProperties: false,
            jdk: '',
            results: [[path: 'allure-results']]
        ]) catch (err) {
                echo "Allure report failed: ${err}"
            }
        }
    }
