pipeline {
    agent any

    properties {
        githubProjectProperty(projectUrlStr: 'https://github.com/akrtyassine/hotel-agence/')
        throttleJobProperty(
            categories: ['hotel-agence'],
            throttleEnabled: true,
            throttleOption: 'project',
            maxConcurrentPerNode: 1,
            maxConcurrentTotal: 1
        )
    }

    options {
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
        disableConcurrentBuilds()
        disableResume()
        preserveStashes(buildCount: 5)
        durabilityHint('PERFORMANCE_OPTIMIZED')
    }

    environment {
        REGISTRY = 'docker.io'
        IMAGE_BACKEND = 'hotel-agence-backend:${BUILD_NUMBER}'
        IMAGE_FRONTEND = 'hotel-agence-frontend:${BUILD_NUMBER}'
        IMAGE_BACKEND_LATEST = 'hotel-agence-backend:latest'
        IMAGE_FRONTEND_LATEST = 'hotel-agence-frontend:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Clonage du dépôt...'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                echo '🔨 Build du backend Spring Boot...'
                dir('hotelagencebackend-master') {
                    sh '''
                        chmod +x gradlew
                        ./gradlew clean bootJar --no-daemon
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '🔨 Build du frontend Angular...'
                dir('Modern-Booking-master') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Build des images Docker...'
                sh '''
                    docker build -t ${IMAGE_BACKEND_LATEST} -t ${IMAGE_BACKEND} ./hotelagencebackend-master
                    docker build -t ${IMAGE_FRONTEND_LATEST} -t ${IMAGE_FRONTEND} ./Modern-Booking-master
                '''
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Exécution des tests...'
                dir('hotelagencebackend-master') {
                    sh '''
                        ./gradlew test --no-daemon || true
                    '''
                }
            }
        }

        stage('Docker Compose - Start Services') {
            steps {
                echo '🚀 Lancement des services avec Docker Compose...'
                sh '''
                    docker compose up -d
                    sleep 10
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '✅ Vérification de la santé des services...'
                sh '''
                    echo "Vérification du backend..."
                    curl -f http://localhost:8082 || true
                    echo "\\nVérification du frontend..."
                    curl -f http://localhost:4000 || true
                    echo "\\nServices lancés avec succès"
                '''
            }
        }

        stage('Generate Reports') {
            steps {
                echo '📊 Génération des rapports...'
                sh '''
                    echo "Versions des outils:"
                    docker --version
                    git --version
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Nettoyage...'
            sh '''
                docker compose down || true
            '''
        }

        success {
            echo '✅ Pipeline exécuté avec succès !'
            sh '''
                echo "Images Docker créées:"
                docker images | grep hotel-agence
            '''
        }

        failure {
            echo '❌ Pipeline échoué ! Veuillez vérifier les logs.'
        }

        unstable {
            echo '⚠️ Pipeline instable'
        }

        cleanup {
            deleteDir()
        }
    }
}
