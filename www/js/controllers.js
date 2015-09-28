angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $location, Auth) {
    Auth.$onAuth(function(authData){
        $scope.authData = authData;
    });
})
.controller('AddCachorroController', function(
    $scope,
    Auth,
    FirebaseRef,
    $firebaseObject,
    $ionicLoading
){
    $scope.cachorro = {};

    Auth.$onAuth(function(authData){
        $scope.authData = authData;
    });

    $scope.add = function(){
        var cachorro = FirebaseRef
            .child("users")
            .child($scope.authData.uid)
            .child("cachorros");
        $scope.novoCachorro = cachorro.push();
        
        $ionicLoading.show({template: 'Salvando, aguarde...'});
        $scope
            .novoCachorro
            .set($scope.cachorro,
                function(error){
                    console.log(error);
                    if (!error) {
                        console.log($scope.cachorro);
                        $scope.cachorro = {};
                    }
                    $ionicLoading.hide();
                }
            );
    };
})
.controller('MeusCachorrosController', function(
    $scope,
    Auth,
    FirebaseRef,
    $firebaseArray
){
    $scope.cachorros = [];
    Auth.$onAuth(function(authData){
        $scope.authData = authData;
        var cachorros = FirebaseRef.child("users/" + $scope.authData.uid + "/cachorros");
        $scope.cachorros = $firebaseArray(cachorros);
        console.log($scope.cachorros);
    });
})
.controller('SimpleLoginController', function(
    $scope,
    $ionicModal,
    $location,
    $cordovaToast,
    FirebaseRef,
    $firebaseObject,
    store,
    $state
) {
    $scope.user = {};

    $scope.doSimpleLogin = function(){
        FirebaseRef.authWithPassword($scope.user, function(error, userData){
            if (error) {
                $cordovaToast.show('Combinação Email/Senha incorreta.', 'long', 'bottom');
            } else {
                store.set('me', userData);
                $state.go('app.meus-cachorros');
            }
        });
    };
})

.controller('CriarContaController', function(
    $scope,
    $ionicLoading,
    $cordovaToast,
    FirebaseRef,
    $firebaseArray
) {
    $scope.user = {};

    $scope.createUser = function(){
        $ionicLoading.show({template: 'Salvando, aguarde...'});
        FirebaseRef.createUser($scope.user, function(error, userData){
            var message;
            if (error) {
                switch (error.code) {
                    case "EMAIL_TAKEN":
                        message = "O email informado já está em uso por outro usuário.";
                    break;
                    case "INVALID_EMAIL":
                        message = "O email informado é inválido.";
                    break;
                    default:
                        message = "Ocorreu um erro ao criar a sua conta.";
                }
            } else {
                message = "Conta criada com suscesso.";
                FirebaseRef.child('users/' + userData.uid).set({
                    name: $scope.user.name
                });
                $scope.user = {};
            }
            $ionicLoading.hide();
            console.log(message);
            $cordovaToast.show(message, 'long', 'bottom');
        });
    };
})
.controller('LoginController', function($scope, FirebaseRef, Auth, $cordovaFacebook, $cordovaToast) {
    $scope.img = null;
    Auth.$onAuth(function(data){
        if (data) {
            $scope.img = data.facebook.profileImageURL;
            console.log(data.facebook.profileImageURL);
        }
    });
    // $scope.doLogin = function(authMethod) {
    //    Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
    //      console.log('oi');
    //      console.log(authData);
    //    }).catch(function(error) {
    //      console.log('erro');
    //      if (error.code === 'TRANSPORT_UNAVAILABLE') {
    //        Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
    //        });
    //      } else {
    //        console.log(error);
    //      }
    //    });
    //  };

$scope.doToast = function(){
     $cordovaToast
        .show('Here is a message', 'long', 'center');
    };

    $scope.doLogin = function(){

$cordovaFacebook.login(["public_profile", "email"])
        .then(function(success) {
            $cordovaFacebook.api("me", ["public_profile"])
        .then(function(success) {
            console.log(success);
        }, function (error) {
            // error
        });
        }, function (error) {
            console.log(error);
        });

        // $cordovaFacebook.getAccessToken()
        //     .then(function(success) {
        //       alert(success);
        //     }, function (error) {
        //       console.log(error);
        //     });
    };

})
.controller('PessoasController', function(
    $scope,
    Pessoas,
    Friends
) {

    $scope.pessoas = [];

    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.pessoas = Pessoas.getCache();
        Pessoas
            .get()
            .then(function(users){
                $scope.pessoas = users;
            });
    });

    $scope.addFriend = function(newFriend){
        Friends.add(newFriend);
    };

})

.controller('LogoutController', function($scope, $state, FirebaseRef) {
    FirebaseRef
        .unauth()
        .then(function(){
            
        });
})
.controller('FriendsController', function($scope, Friends, FirebaseRef, $firebaseObject, store) {
    $scope.friends = [];
    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        FirebaseRef
            .child('friends')
            .child(store.get('me').uid)
            .on('value', function(friendsSnap) {
                $scope.friends = [];
                angular.forEach(friendsSnap.val(), function(v, k){
                    $scope.friends.push($firebaseObject(FirebaseRef.child('users').child(k)));
                });
                console.log($scope.friends);
            });
    });
})
.controller('ChatController', function(
    $scope,
    $stateParams,
    FirebaseRef,
    Messages,
    store,
    $firebaseArray,
    $firebaseObject,
    Firebase,
    $ionicScrollDelegate
) {
    $scope.message = {};
    $scope.messages = [];

    $scope.$on( "$ionicView.beforeEnter", function(scopes, states) {
        $scope.me = store.get('me').uid;
        $scope.friendId=  $stateParams.friendId;
        
        $ionicScrollDelegate.scrollBottom();

        var tey = FirebaseRef
            .child('friends')
            .child(store.get('me').uid)
            .child($stateParams.friendId);

        $firebaseObject(tey).$loaded().then(function(data){
            console.log(data);
            var chatId = (data.primary) ? store.get('me').uid + '_' + $stateParams.friendId : $stateParams.friendId + '_' + store.get('me').uid;

            var messages = FirebaseRef
                .child('chats')
                .child(chatId)
                .orderByChild('timestamp')
                .limitToLast(20);
            $scope.messages = $firebaseArray(messages);
        });

    });

    $scope.sendMessage = function(){
        $scope.message.timestamp = Firebase.ServerValue.TIMESTAMP;
        $scope.messages.$add($scope.message);
        $scope.message = {};
        $ionicScrollDelegate.scrollBottom();
    };
})
.controller('EmptyController', function($scope, $stateParams) {
});
