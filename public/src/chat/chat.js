(function(angular){
    'use strict';

    angular.module('chat',[
        'common'
    ])
        .config(function($stateProvider){
            $stateProvider.state('chat',{
                url: '/chat',
                views:{
                    main: {
                        templateUrl: 'chat/chat.tpl.html',
                        controller: 'ChatController'
                    }
                },
                resolve: {
                    me: function($http,$state){
                        return new Promise(function(resolve,reject){
                            $http
                                .get('http://localhost:5011/api/me')
                                .success(function(){
                                    resolve();
                                })
                                .catch(function(){
                                    $state.go('login');
                                    reject();
                                });
                        });

                    }
                }
            });
        })
        .controller('ChatController',function($scope,socket,$window,$mdSidenav,auth,$state,$mdDialog, $mdToast){

            $scope.toggleRooms = function(){
                $mdSidenav('chatrooms').toggle()
            };

            $scope.toggleUsers = function(){
                $mdSidenav('chatusers').toggle()
            };

            $scope.logout = function(){
                socket.disconnect();
                auth.signOut();
                $state.go('login');
            };

            $scope.messages = [];

            socket.on('message',function(message,e){
                console.log(message)
                $scope.messages.push(message)
            });

            $scope.sendMessage = function(){
                socket.emit('message',$scope.message);
            };

            $scope.joinRoom=function(room){
                $mdDialog.show({
                    templateUrl: 'chat/room.tpl.html',
                    controller: function($scope,roomFactory){
                        console.log(room);
                        var roomSocket = roomFactory.join(room);
                        $scope.messages = [];

                        roomSocket.on('message',function(message,e){
                            console.log(message,e)
                            $scope.messages.push(message)
                        });

                        $scope.sendMessage = function(){
                            roomSocket.emit('message',$scope.roomMessage);
                        };

                        $scope.leave = function(){

                        }
                    }

                });
            };

            $scope.privateMessage = function(user){

                socket.emit('message::private',{
                    to: user.socketId
                });

            };

            socket.on('message::private',function(message){
                $mdToast.show(
                    $mdToast.simple()
                        .content(message.sender+ ' : pokes you')
                        .hideDelay(20000)
                )
            });

            $scope.rooms = [];
            $scope.users = [];

            socket.on('user::list',function(users){
               $scope.users = users;
            });

            socket.on('user::new',function(user){
                console.log(user)
                $scope.users.push(user);
            });

            socket.on('room::list',function(rooms){
                $scope.rooms = rooms;
                console.log('rooms',rooms)
            });

            socket.on('room::new',function(room){
                console.log(room)
                $scope.rooms.push(room);
            });

            $scope.createRoom = function(){
                socket.emit('room::create',$scope.myRoom.name);
                socket.once('room::create',function(room){
                    console.log(room)
                    $scope.rooms.push(room);
                })
            }
        })
})(window.angular);