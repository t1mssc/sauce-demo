pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        CI = 'true'
        NODE_ENV = 'ci'
        IMAGE_NAME = 'playwright-local'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/t1mssc/sauce-demo.git'
            }
        }

        stage('Install Dependencies') {
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
                        sh "docker build -t ${IMAGE_NAME} ."
                    } else {
                        bat 'docker build -t %IMAGE_NAME% .'
                    }
                }
            }
        }

        stage('Run Playwright Tests (Docker)') {
            steps {
                script {
                    if (isUnix()) {
                        sh """
                        docker run --rm \
                        -v \$WORKSPACE/playwright-report:/app/playwright-report \
                        -v \$WORKSPACE/allure-results:/app/allure-results \
                        ${IMAGE_NAME} npm run playwright:test
                        """
                    } else {
                        bat '''
                        docker run --rm ^
                        -v "%WORKSPACE%\\playwright-report:/app/playwright-report" ^
                        -v "%WORKSPACE%\\allure-results:/app/allure-results" ^
                        %IMAGE_NAME% npm run playwright:test
                        '''
                    }
                }
            }
        }
    }
}

post {
    always {
        script {
            echo '📂 Debug artifacts...'

            if (isUnix()) {
                sh 'ls -l allure-results || true'
            } else {
                bat 'dir allure-results || echo No allure-results'
            }

            echo '📊 Restoring Allure history...'

            if (fileExists('allure-history/history')) {
                if (isUnix()) {
                    sh 'mkdir -p allure-results/history && cp -r allure-history/history/* allure-results/history || true'
                } else {
                    bat '''
                    if not exist allure-results\\history mkdir allure-results\\history
                    xcopy /E /I /Y allure-history\\history\\* allure-results\\history\\
                    '''
                }
            }
        }

        // ✅ Generate report with history
        allure([
            includeProperties: false,
            jdk: '',
            results: [[path: 'allure-results']]
        ])

        script {
            echo '💾 Saving Allure history...'

            if (isUnix()) {
                sh '''
                mkdir -p allure-history
                if [ -d "allure-report/history" ]; then
                    cp -r allure-report/history allure-history/
                fi
                '''
            } else {
                bat '''
                if not exist allure-history mkdir allure-history
                if exist allure-report\\history (
                    xcopy /E /I /Y allure-report\\history allure-history\\history\\
                )
                '''
            }
        }

        archiveArtifacts artifacts: 'allure-history/**', allowEmptyArchive: true
    }
}
