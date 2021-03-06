// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var prod = false;

angular.module('starter', [
    'ionic',
    'starter.controllers',
    'starter.services',
    'firebase',
    'ngCordova',
    'angular-storage',
    'angularMoment'
])
.constant('CONFIG', {
    FIREBASE_URL: 'https://api-cachorro.firebaseio.com/',
    HOME: 'home',
    DEFAULT_VIEW: 'app.pessoas'
})

.run(function(CONFIG, $ionicPlatform, $state, $location, Auth, FirebaseRef, $rootScope) {
    // Aqui é um watch para os dados do usuário logado, coloco no rootscope para ter acesso constante em qualquer lugar
    $rootScope.authData = null;
    Auth.$onAuth(function(authData){
        $rootScope.authData = (authData) ? authData : null;
    });

    $rootScope.$on('$stateChangeStart', function(e, to){
    });

    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
        if (error === "AUTH_REQUIRED") {
            event.preventDefault();
            $location.path(CONFIG.HOME);
        }
    });

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function(
    $stateProvider,
    $urlRouterProvider) {

        // var appID = 1630103417265894;
        // var version = "v2.4"; 
        // $cordovaFacebookProvider.browserInit(appID, version);

    $stateProvider

        .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })
    .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })

    .state('app.browse', {
            url: '/browse',
            views: {
                'menuContent': {
                    templateUrl: 'templates/browse.html'
                }
            }
        })
        .state('app.playlists', {
            url: '/playlists',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlists.html',
                    controller: 'PlaylistsCtrl'
                }
            }
        })
    .state('app.add-cachorro', {
        url: '/add-cachorro',
        views: {
            'menuContent': {
                templateUrl: 'templates/add-cachorro.html',
                controller: 'AddCachorroController'
            }
        }
    })
    .state('app.pessoas', {
        url: '/pessoas',
        views: {
            'menuContent': {
                templateUrl: 'templates/pessoas.html',
                controller: 'PessoasController',
                resolve: {
                    'requireAuth': ['Auth', function(Auth){
                        return Auth.$requireAuth();
                    }],
                    'currentAuth': ['Auth', function(Auth){
                        return Auth.$waitForAuth();
                    }]
                }
            }
        }
    })
    .state('app.friends', {
        url: '/friends',
        views: {
            'menuContent': {
                templateUrl: 'templates/friends.html',
                controller: 'FriendsController'
            }
        }
    })
    .state('app.chat', {
        url: '/chat/:friendId',
        views: {
            'menuContent': {
                templateUrl: 'templates/chat.html',
                controller: 'ChatController'
            }
        }
    })
    .state('app.meus-cachorros', {
        url: '/meus-cachorros',
        views: {
            'menuContent': {
                templateUrl: 'templates/meus-cachorros.html',
                controller: 'MeusCachorrosController'
            }
        }
    })
    .state('app.simple-login', {
        url: '/simple-login',
        views: {
            'menuContent': {
                templateUrl: 'templates/simple-login.html',
                controller: 'SimpleLoginController'
            }
        }
    })
    .state('logout', {
        url: '/logout',
        templateUrl: 'templates/logout.html',
        controller: 'LogoutController'
    })
    .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeController',
        resolve: {
        }
    })
    .state('app.criar-conta', {
        url: '/criar-conta',
        views: {
            'menuContent': {
                templateUrl: 'templates/criar-conta.html',
                controller: 'CriarContaController'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function($injector, $location){
        var Auth = $injector.get('Auth');
        var state = $injector.get('$state');
        var config = $injector.get('CONFIG');

        if (Auth.$getAuth()) {
            state.go(config.DEFAULT_VIEW);
        } else {
            state.go(config.HOME);
        }
    });
});
