angular.module('starter.services', [])

.factory('FirebaseRef', function(CONFIG) {
    return new Firebase(CONFIG.FIREBASE_URL);
})
.factory('Auth', function($firebaseAuth, FirebaseRef) {
    return $firebaseAuth(FirebaseRef);
})
.factory('Me', function(store) {
    return store.get('me');
})
.factory('Messages', function(store, FirebaseRef, $q) {
    return {
    	get: function(friendId){
    		var defer = $q.defer();
    		Firebase
    			.child('chats')
    			.child(store.get('me').uid + '_' + friendId);
    		defer.resolve();
    		return defer.promise;
    	}
    };
})

.factory('Friends', function($q, $firebaseArray, $firebaseObject, store, FirebaseRef) {
    return {
    	add: function(newFriend){
    		var myUid = store.get('me').uid;
    		var myFriends = FirebaseRef
    			.child('friends')
    			.child(myUid)
    			.child(newFriend.$id);

    		myFriends.transaction(function(currentData){
    			return {
	    			primary: true,
	    			timestamp: 'agora'
    			};
    		}, function(error, commited, snapshot){
    			console.log(commited);
    			if (commited) {
		    		var invited = FirebaseRef
		    			.child('friends')
		    			.child(newFriend.$id)
		    			.child(myUid);

		    		invited.transaction(function(currentData){
		    			return {
			    			primary: false,
			    			timestamp: 'agora'
		    			};
		    		}, function(error, commited, snapshot){
		    		});
		    	}
    		});
    	},
    	get: function(){
    		var defer = $q.defer();

    		var friends = [];
    		console.log('tey');
			FirebaseRef
				.child('friends')
				.child(store.get('me').uid)
				.on('child_added', function(friendsSnap) {
					console.log('tey');
					console.log(friendsSnap.val());
					angular.forEach(friendsSnap.val(), function(v, k){
						friends.push($firebaseObject(FirebaseRef.child('users').child(k)));
					});
					defer.resolve(friends);
				});

			return defer.promise;
    	}
    };
})
.factory('Pessoas', function($firebaseArray, FirebaseRef, $q, store) {
    return {
    	getCache: function(){
    		return store.get('pessoas');
    	},
    	get: function(){
    		var defer = $q.defer();
    		$firebaseArray(FirebaseRef.child('users'))
	    		.$loaded()
	    			.then(function(users){
	    				store.set('pessoas', users);
	    				defer.resolve(users);
	    			});
    		return defer.promise;
    	}
    };
});
