'use strict';

angular.module('xenon.controllers', []).
	controller('LoginCtrl', function($scope, $rootScope)
	{
		$rootScope.isLoginPage        = true;
		$rootScope.isLightLoginPage   = false;
		$rootScope.isLockscreenPage   = false;
		$rootScope.isMainPage         = false;
	}).
	controller('LoginLightCtrl', function($scope, $rootScope)
	{
		$rootScope.isLoginPage        = true;
		$rootScope.isLightLoginPage   = true;
		$rootScope.isLockscreenPage   = false;
		$rootScope.isMainPage         = false;
	}).
	controller('LockscreenCtrl', function($scope, $rootScope)
	{
		$rootScope.isLoginPage        = false;
		$rootScope.isLightLoginPage   = false;
		$rootScope.isLockscreenPage   = true;
		$rootScope.isMainPage         = false;
	}).
	controller('MainCtrl', function($scope, $rootScope, $location, $layout, $layoutToggles, $pageLoadingBar, Fullscreen)
	{
		$rootScope.isLoginPage        = false;
		$rootScope.isLightLoginPage   = false;
		$rootScope.isLockscreenPage   = false;
		$rootScope.isMainPage         = true;

		$rootScope.layoutOptions = {
			horizontalMenu: {
				isVisible		: true,
				isFixed			: true,
				minimal			: false,
				clickToExpand	: false,

				isMenuOpenMobile: false
			},
			sidebar: {
				isVisible		: false,
				isCollapsed		: true,
				toggleOthers	: true,
				isFixed			: true,

				isMenuOpenMobile: false,

				// Added in v1.3
				userProfile		: true
			},
			chat: {
				isOpen			: false,
			},
			settingsPane: {
				isOpen			: false,
				useAnimation	: true
			},
			container: {
				isBoxed			: false
			},
			skins: {
				sidebarMenu		: '',
				horizontalMenu	: '',
				userInfoNavbar	: ''
			},
			pageTitles: true,
			userInfoNavVisible	: false
		};

		$layout.loadOptionsFromCookies(); // remove this line if you don't want to support cookies that remember layout changes


		$scope.updatePsScrollbars = function()
		{
			var $scrollbars = jQuery(".ps-scrollbar:visible");

			$scrollbars.each(function(i, el)
			{
				if(typeof jQuery(el).data('perfectScrollbar') == 'undefined')
				{
					jQuery(el).perfectScrollbar();
				}
				else
				{
					jQuery(el).perfectScrollbar('update');
				}
			})
		};


		// Define Public Vars
		public_vars.$body = jQuery("body");


		// Init Layout Toggles
		$layoutToggles.initToggles();


		// Other methods
		$scope.setFocusOnSearchField = function()
		{
			public_vars.$body.find('.search-form input[name="s"]').focus();

			setTimeout(function(){ public_vars.$body.find('.search-form input[name="s"]').focus() }, 100 );
		};


		// Watch changes to replace checkboxes
		$scope.$watch(function()
		{
			cbr_replace();
		});

		// Watch sidebar status to remove the psScrollbar
		$rootScope.$watch('layoutOptions.sidebar.isCollapsed', function(newValue, oldValue)
		{
			if(newValue != oldValue)
			{
				if(newValue == true)
				{
					public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('destroy')
				}
				else
				{
					public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar({wheelPropagation: public_vars.wheelPropagation});
				}
			}
		});


		// Page Loading Progress (remove/comment this line to disable it)
		$pageLoadingBar.init();

		$scope.showLoadingBar = showLoadingBar;
		$scope.hideLoadingBar = hideLoadingBar;


		// Set Scroll to 0 When page is changed
		$rootScope.$on('$stateChangeStart', function()
		{
			var obj = {pos: jQuery(window).scrollTop()};

			TweenLite.to(obj, .25, {pos: 0, ease:Power4.easeOut, onUpdate: function()
			{
				$(window).scrollTop(obj.pos);
			}});
		});


		// Full screen feature added in v1.3
		$scope.isFullscreenSupported = Fullscreen.isSupported();
		$scope.isFullscreen = Fullscreen.isEnabled() ? true : false;

		$scope.goFullscreen = function()
		{
			if (Fullscreen.isEnabled())
				Fullscreen.cancel();
			else
				Fullscreen.all();

			$scope.isFullscreen = Fullscreen.isEnabled() ? true : false;
		}

	}).
	controller('SidebarMenuCtrl', function($scope, $rootScope, $menuItems, $timeout, $location, $state, $layout)
	{

		// Menu Items
		var $sidebarMenuItems = $menuItems.instantiate();

		$scope.menuItems = $sidebarMenuItems.prepareSidebarMenu().getAll();

		// Set Active Menu Item
		$sidebarMenuItems.setActive( $location.path() );

		$rootScope.$on('$stateChangeSuccess', function()
		{
			$sidebarMenuItems.setActive($state.current.name);
		});

		// Trigger menu setup
		public_vars.$sidebarMenu = public_vars.$body.find('.sidebar-menu');
		$timeout(setup_sidebar_menu, 1);

		ps_init(); // perfect scrollbar for sidebar
	}).
	controller('HorizontalMenuCtrl', function(authentication, $scope, $rootScope, $menuItems, $timeout, $location, $state)
	{
		$scope.currentUser = authentication.currentUser();
		$scope.isLoggedIn = authentication.isLoggedIn();

		$scope.logout = function() {
			console.log("logout");
			authentication.logout();
			$state.go('signin');
		}

		var $horizontalMenuItems = $menuItems.instantiate();

		$scope.menuItems = $horizontalMenuItems.prepareHorizontalMenu().getAll();

		// Set Active Menu Item
		$horizontalMenuItems.setActive( $location.path() );

		

		// Trigger menu setup
		$timeout(setup_horizontal_menu, 1);
	}).
	controller('SettingsPaneCtrl', function($rootScope)
	{
		// Define Settings Pane Public Variable
		public_vars.$settingsPane = public_vars.$body.find('.settings-pane');
		public_vars.$settingsPaneIn = public_vars.$settingsPane.find('.settings-pane-inner');
	}).
	controller('ChatCtrl', function($scope, $element)
	{
		var $chat = jQuery($element),
			$chat_conv = $chat.find('.chat-conversation');

		$chat.find('.chat-inner').perfectScrollbar(); // perfect scrollbar for chat container


		// Chat Conversation Window (sample)
		$chat.on('click', '.chat-group a', function(ev)
		{
			ev.preventDefault();

			$chat_conv.toggleClass('is-open');

			if($chat_conv.is(':visible'))
			{
				$chat.find('.chat-inner').perfectScrollbar('update');
				$chat_conv.find('textarea').autosize();
			}
		});

		$chat_conv.on('click', '.conversation-close', function(ev)
		{
			ev.preventDefault();

			$chat_conv.removeClass('is-open');
		});
	}).
	controller('UIModalsCtrl', function($scope, $rootScope, $modal, $sce)
	{
		// Open Simple Modal
		$scope.openModal = function(modal_id, modal_size, modal_backdrop)
		{
			$rootScope.currentModal = $modal.open({
				templateUrl: modal_id,
				size: modal_size,
				backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
			});
		};

		// Loading AJAX Content
		$scope.openAjaxModal = function(modal_id, url_location)
		{
			$rootScope.currentModal = $modal.open({
				templateUrl: modal_id,
				resolve: {
					ajaxContent: function($http)
					{
						return $http.get(url_location).then(function(response){
							$rootScope.modalContent = $sce.trustAsHtml(response.data);
						}, function(response){
							$rootScope.modalContent = $sce.trustAsHtml('<div class="label label-danger">Cannot load ajax content! Please check the given url.</div>');
						});
					}
				}
			});

			$rootScope.modalContent = $sce.trustAsHtml('Modal content is loading...');
		}
	}).
	controller('PaginationDemoCtrl', function($scope)
	{
		$scope.totalItems = 64;
		$scope.currentPage = 4;

		$scope.setPage = function (pageNo)
		{
			$scope.currentPage = pageNo;
		};

		$scope.pageChanged = function()
		{
			console.log('Page changed to: ' + $scope.currentPage);
		};

		$scope.maxSize = 5;
		$scope.bigTotalItems = 175;
		$scope.bigCurrentPage = 1;
	}).
	controller('LayoutVariantsCtrl', function($scope, $layout, $cookies)
	{
		$scope.opts = {
			sidebarType: null,
			fixedSidebar: null,
			sidebarToggleOthers: null,
			sidebarVisible: null,
			sidebarPosition: null,

			horizontalVisible: null,
			fixedHorizontalMenu: null,
			horizontalOpenOnClick: null,
			minimalHorizontalMenu: null,

			sidebarProfile: null
		};

		$scope.sidebarTypes = [
			{value: ['sidebar.isCollapsed', false], text: 'Expanded', selected: $layout.is('sidebar.isCollapsed', false)},
			{value: ['sidebar.isCollapsed', true], text: 'Collapsed', selected: $layout.is('sidebar.isCollapsed', true)},
		];

		$scope.fixedSidebar = [
			{value: ['sidebar.isFixed', true], text: 'Fixed', selected: $layout.is('sidebar.isFixed', true)},
			{value: ['sidebar.isFixed', false], text: 'Static', selected: $layout.is('sidebar.isFixed', false)},
		];

		$scope.sidebarToggleOthers = [
			{value: ['sidebar.toggleOthers', true], text: 'Yes', selected: $layout.is('sidebar.toggleOthers', true)},
			{value: ['sidebar.toggleOthers', false], text: 'No', selected: $layout.is('sidebar.toggleOthers', false)},
		];

		$scope.sidebarVisible = [
			{value: ['sidebar.isVisible', true], text: 'Visible', selected: $layout.is('sidebar.isVisible', true)},
			{value: ['sidebar.isVisible', false], text: 'Hidden', selected: $layout.is('sidebar.isVisible', false)},
		];

		$scope.sidebarPosition = [
			{value: ['sidebar.isRight', false], text: 'Left', selected: $layout.is('sidebar.isRight', false)},
			{value: ['sidebar.isRight', true], text: 'Right', selected: $layout.is('sidebar.isRight', true)},
		];

		$scope.horizontalVisible = [
			{value: ['horizontalMenu.isVisible', true], text: 'Visible', selected: $layout.is('horizontalMenu.isVisible', true)},
			{value: ['horizontalMenu.isVisible', false], text: 'Hidden', selected: $layout.is('horizontalMenu.isVisible', false)},
		];

		$scope.fixedHorizontalMenu = [
			{value: ['horizontalMenu.isFixed', true], text: 'Fixed', selected: $layout.is('horizontalMenu.isFixed', true)},
			{value: ['horizontalMenu.isFixed', false], text: 'Static', selected: $layout.is('horizontalMenu.isFixed', false)},
		];

		$scope.horizontalOpenOnClick = [
			{value: ['horizontalMenu.clickToExpand', false], text: 'No', selected: $layout.is('horizontalMenu.clickToExpand', false)},
			{value: ['horizontalMenu.clickToExpand', true], text: 'Yes', selected: $layout.is('horizontalMenu.clickToExpand', true)},
		];

		$scope.minimalHorizontalMenu = [
			{value: ['horizontalMenu.minimal', false], text: 'No', selected: $layout.is('horizontalMenu.minimal', false)},
			{value: ['horizontalMenu.minimal', true], text: 'Yes', selected: $layout.is('horizontalMenu.minimal', true)},
		];

		$scope.chatVisibility = [
			{value: ['chat.isOpen', false], text: 'No', selected: $layout.is('chat.isOpen', false)},
			{value: ['chat.isOpen', true], text: 'Yes', selected: $layout.is('chat.isOpen', true)},
		];

		$scope.boxedContainer = [
			{value: ['container.isBoxed', false], text: 'No', selected: $layout.is('container.isBoxed', false)},
			{value: ['container.isBoxed', true], text: 'Yes', selected: $layout.is('container.isBoxed', true)},
		];

		$scope.sidebarProfile = [
			{value: ['sidebar.userProfile', false], text: 'No', selected: $layout.is('sidebar.userProfile', false)},
			{value: ['sidebar.userProfile', true], text: 'Yes', selected: $layout.is('sidebar.userProfile', true)},
		];

		$scope.resetOptions = function()
		{
			$layout.resetCookies();
			window.location.reload();
		};

		var setValue = function(val)
		{
			if(val != null)
			{
				val = eval(val);
				$layout.setOptions(val[0], val[1]);
			}
		};

		$scope.$watch('opts.sidebarType', setValue);
		$scope.$watch('opts.fixedSidebar', setValue);
		$scope.$watch('opts.sidebarToggleOthers', setValue);
		$scope.$watch('opts.sidebarVisible', setValue);
		$scope.$watch('opts.sidebarPosition', setValue);

		$scope.$watch('opts.horizontalVisible', setValue);
		$scope.$watch('opts.fixedHorizontalMenu', setValue);
		$scope.$watch('opts.horizontalOpenOnClick', setValue);
		$scope.$watch('opts.minimalHorizontalMenu', setValue);

		$scope.$watch('opts.chatVisibility', setValue);

		$scope.$watch('opts.boxedContainer', setValue);

		$scope.$watch('opts.sidebarProfile', setValue);
	}).
	controller('ThemeSkinsCtrl', function($scope, $layout)
	{
		var $body = jQuery("body");

		$scope.opts = {
			sidebarSkin: $layout.get('skins.sidebarMenu'),
			horizontalMenuSkin: $layout.get('skins.horizontalMenu'),
			userInfoNavbarSkin: $layout.get('skins.userInfoNavbar')
		};

		$scope.skins = [
			{value: '', 			name: 'Default'			,	palette: ['#2c2e2f','#EEEEEE','#FFFFFF','#68b828','#27292a','#323435']},
			{value: 'aero', 		name: 'Aero'			,	palette: ['#558C89','#ECECEA','#FFFFFF','#5F9A97','#558C89','#255E5b']},
			{value: 'navy', 		name: 'Navy'			,	palette: ['#2c3e50','#a7bfd6','#FFFFFF','#34495e','#2c3e50','#ff4e50']},
			{value: 'facebook', 	name: 'Facebook'		,	palette: ['#3b5998','#8b9dc3','#FFFFFF','#4160a0','#3b5998','#8b9dc3']},
			{value: 'turquoise', 	name: 'Truquoise'		,	palette: ['#16a085','#96ead9','#FFFFFF','#1daf92','#16a085','#0f7e68']},
			{value: 'lime', 		name: 'Lime'			,	palette: ['#8cc657','#ffffff','#FFFFFF','#95cd62','#8cc657','#70a93c']},
			{value: 'green', 		name: 'Green'			,	palette: ['#27ae60','#a2f9c7','#FFFFFF','#2fbd6b','#27ae60','#1c954f']},
			{value: 'purple', 		name: 'Purple'			,	palette: ['#795b95','#c2afd4','#FFFFFF','#795b95','#27ae60','#5f3d7e']},
			{value: 'white', 		name: 'White'			,	palette: ['#FFFFFF','#666666','#95cd62','#EEEEEE','#95cd62','#555555']},
			{value: 'concrete', 	name: 'Concrete'		,	palette: ['#a8aba2','#666666','#a40f37','#b8bbb3','#a40f37','#323232']},
			{value: 'watermelon', 	name: 'Watermelon'		,	palette: ['#b63131','#f7b2b2','#FFFFFF','#c03737','#b63131','#32932e']},
			{value: 'lemonade', 	name: 'Lemonade'		,	palette: ['#f5c150','#ffeec9','#FFFFFF','#ffcf67','#f5c150','#d9a940']},
		];

		$scope.$watch('opts.sidebarSkin', function(val)
		{
			if(val != null)
			{
				$layout.setOptions('skins.sidebarMenu', val);

				$body.attr('class', $body.attr('class').replace(/\sskin-[a-z]+/)).addClass('skin-' + val);
			}
		});

		$scope.$watch('opts.horizontalMenuSkin', function(val)
		{
			if(val != null)
			{
				$layout.setOptions('skins.horizontalMenu', val);

				$body.attr('class', $body.attr('class').replace(/\shorizontal-menu-skin-[a-z]+/)).addClass('horizontal-menu-skin-' + val);
			}
		});

		$scope.$watch('opts.userInfoNavbarSkin', function(val)
		{
			if(val != null)
			{
				$layout.setOptions('skins.userInfoNavbar', val);

				$body.attr('class', $body.attr('class').replace(/\suser-info-navbar-skin-[a-z]+/)).addClass('user-info-navbar-skin-' + val);
			}
		});
	}).
	controller('registerCtrl', function($state, $rootScope, $location, authentication)
	{
		console.log("registerCtrl");
		$rootScope.layoutOptions.horizontalMenu.isVisible = false;
		var vm = this;

		vm.credentials = {
		  name : "",
		  email : "",
		  password : ""
		};

		vm.onSubmit = function () {
			console.log(vm.credentials.name + "," + vm.credentials.email + "," + vm.credentials.password);
		  authentication
		    .register(vm.credentials)
		    .error(function(err){
		      alert(err);
		    })
		    .then(function(){
		      $state.go('signin');
		    });
		};
	}).
	controller('loginCtrl', function($rootScope, $location, authentication, $scope, $state)
	{
		$rootScope.layoutOptions.horizontalMenu.isVisible = false;
		//alert("erw");
		var vm = this;

		  vm.credentials = {
		    email : "",
		    password : ""
		  };

		  vm.onSubmit = function () {
		  	console.log(vm.credentials.email + "," + vm.credentials.password);
		    authentication
		    .login(vm.credentials)
		    .error(function(err){
		      alert(err.message);
		    })
		    .then(function(){
		    	
		      $state.go('choose');
		    });
		  };

		  $scope.signup = function() {
		  	//alert("33");
		  	$state.go('signup');
		  }
	}).
	controller('chooseCtrl', function($rootScope, $scope, $state)
	{
		$scope.go_EU_app = function() {
			$rootScope.layoutOptions.horizontalMenu.isVisible = true;
			$rootScope.game = 'EU';
			$state.go('app.home');
		};

		$scope.go_US_app = function() {
			$rootScope.layoutOptions.horizontalMenu.isVisible = true;
			$rootScope.game = 'US';
			$state.go('app.homeUS');
		};
	}).
	controller('UserCtrl', function($scope, $rootScope, $element, $state, $http)
	{		
		$scope.requests_list = [];

		$http.get($rootScope.api_path + 'users/all')
	   		.success(function(res) {
				console.log(JSON.stringify(res));
				if(res.status=='success') {						
					$scope.users_list = res.users;
				}
			});

	}).
	controller('WithdrawCtrl', function($scope, $rootScope, $element, $state, $http)
	{
		$scope.requests_list = [];

		$http.get($rootScope.api_path + 'verify/all')
	   		.success(function(res) {
				console.log(JSON.stringify(res));
				if(res.status=='success') {						
					$scope.requests_list = res.requests;										
				}
			});

		$scope.newValue = function(id, value, index) {
		     console.log(id + "," + index + "," + value);
		     //if(value==true) {
			     $http.post($rootScope.api_path + 'withdraw/' + id +'/update/status',
				    {
				    	index: index,
						new_status: value
					}
					).success(function(res) {
						console.log(JSON.stringify(res));					
					});
			//}
		}
	}).
	controller('VerifyCtrl', function($scope, $rootScope, $element, $state, $http)
	{		
		$scope.requests_list = [];

		$http.get($rootScope.api_path + 'verify/all')
	   		.success(function(res) {
				console.log(JSON.stringify(res));
				if(res.status=='success') {						
					$scope.requests_list = res.requests;
				}
			});

		$scope.newValue = function(id, value) {
		     console.log(id + "," + value);
		     $http.post($rootScope.api_path + 'verify/' + id +'/update/status',
			    {
					new_status: value
				}
				).success(function(res) {
					console.log(JSON.stringify(res));					
				});
		}
	}).
	controller('FBListCtrl', function(Excel, $timeout, $scope, $rootScope, $element, $state, $http)
	{
		$scope.list = [];

		$http.get($rootScope.api_path + 'users/fbList')
	     	.success(function(res) {
				console.log(JSON.stringify(res));
				$scope.list = res.fbList;					
			});

	     $scope.exportToExcel = function(tableId) {
	     	var exportHref = Excel.tableToExcel(tableId, 'WireWorkbenchDataExport');
	     	$timeout(function() {
	     		location.href = exportHref;
	     	}, 100);
	     };
	}).
	controller('PrizeCtrl', function($scope, $rootScope, $element, $state, $http)
	{		
		$scope.selected_league = 0;
		$scope.jackpot_pool = 0;
		$scope.increase_jackpot = 0;
		$scope.league_pool = 0;
		$scope.increase_league = 0;

		$http.get($rootScope.api_path + 'prizepool')
	   		.success(function(res) {
				console.log(JSON.stringify(res));
				if(res.status=='success') {						
					$scope.jackpot_pool = res.prizepool.jackpot_pool;
					$scope.increase_jackpot = res.prizepool.inc_jack_per_ad;
				}
			});

		$scope.change_league = function() {
			console.log($scope.selected_league);
		   	$scope.league_index = $scope.selected_league;
		   
		   	$http.get($rootScope.api_path + 'prizepool/' + $scope.league_index)
		   		.success(function(res) {
					console.log(JSON.stringify(res));
					if(res.status=='success') {						
						$scope.league_pool = res.pool;
						$scope.increase_league = res.inc_per_ad;
					}
					else {
						$scope.league_pool = 0;
						$scope.increase_league = 0;
					}
				});
		};

		$scope.update_prizepool_data = function() {
			$http.post($rootScope.api_path + 'prizepool/' + $scope.league_index,
			{
				jackpot_pool: $scope.jackpot_pool,
				inc_jack_per_ad: $scope.increase_jackpot,
				league_pool: $scope.league_pool,
				inc_league_per_ad: $scope.increase_league
			}
			).success(function(res) {
				alert(JSON.stringify(res));
			});
		};
	}).
	controller('HomeCtrl', function($scope, $rootScope, $element, $state, $http)
	{		
		var vm = this;
		vm.jersey = [];

		$scope.league_index = 1;
		$scope.selected_league = 0;
		$scope.fixture_index = 1;
		$scope.selected_fixture = 0;

		$scope.league_name_array = ["Primera Division", "Premier League", "Serie A", "Ligue 1", "Champions League", "Bundesliga"];
		$scope.team_arry = [1];
		//$scope.jersey = [];
		$scope.team_cnt = 1;
		$scope.teamabbr = [];
		$scope.teamname = [];
		$scope.jersey_name = [];
		$scope.fixture_week_arry = [];
		for (var i = 1; i <= 40; i++) $scope.fixture_week_arry.push(i)

		$scope.game_arry = [];
		$scope.home_team = [];
		$scope.away_team = [];
		$scope.game_result = [];
		for (var i = 1; i <= $rootScope.game_count; i++) {
			$scope.game_arry.push(i);
			$scope.home_team[i] = $scope.away_team[i] = 1;
			$scope.game_result[i] = 0;
		}

		$scope.fixture_data = [];

		$scope.inc_team_cnt = function() {
			var e = document.getElementById("team_cnt");
			//console.log(e.value);
			$scope.team_cnt = parseInt(e.value) + 1;
			$scope.team_arry = [];
			for (var i = 1; i <= $scope.team_cnt; i++) {
				$scope.team_arry.push(i)
				$scope.home_team[i] = $scope.away_team[i] = 1;
				$scope.game_result[i] = 0;
			}
			//console.log($scope.team_cnt);
		};

		$scope.dec_team_cnt = function() {
			var e = document.getElementById("team_cnt");
			//console.log(e.value);
			if(e.value == '1')
				$scope.team_cnt = 1;
			else
				$scope.team_cnt = parseInt(e.value) - 1;
			$scope.team_arry = [];
			for (var i = 1; i <= $scope.team_cnt; i++) {
				$scope.team_arry.push(i)
				$scope.home_team[i] = $scope.away_team[i] = 1;
				$scope.game_result[i] = 0;
			}
			//console.log($scope.team_cnt);
		};

		$scope.change_league = function() {
			console.log($scope.selected_league);
		   	$scope.league_index = $scope.selected_league;
		   	$scope.league_name = $scope.league_name_array[$scope.selected_league-1];

		   	$http.get($rootScope.api_path + 'league/' + $scope.league_index)
		   		.success(function(res) {
					//console.log(JSON.stringify(res));
					if(res && res.status=='success') {
						//$scope.league_name = res.data.name;
						$scope.team_cnt = res.data.team_cnt;
						var e = document.getElementById("team_cnt");
						e.value = res.data.team_cnt;
						$scope.team_arry = [];
						for (var i = 1; i <= $scope.team_cnt; i++) {
							$scope.team_arry.push(i)							
							$scope.teamname[i] = res.data.team_info[i-1].name;
							$scope.teamabbr[i] = res.data.team_info[i-1].abbr;
							var e = document.getElementById("jersey_"+i);
							if(e && e.value)
							e.value = "";		
							vm.jersey[i] = res.data.team_info[i-1].jersey;
							$scope.jersey_name[i] = res.data.team_info[i-1].jersey_name;
							console.log($scope.jersey_name[i]);
						}
					}
					else {
						console.log("none");
						$scope.team_cnt = 1;
						var e = document.getElementById("team_cnt");
						e.value = 1;
						$scope.team_arry = [1];							
						$scope.teamname = [];
						$scope.teamabbr = [];
						vm.jersey = [];
						$scope.jersey_name = [];
					}
				});
		}

		$scope.change_fixture = function() {
			console.log("change_fixture");
			var months = new Array(12);
			months[0] = "Jan";
			months[1] = "Feb";
			months[2] = "Mar";
			months[3] = "Apr";
			months[4] = "May";
			months[5] = "Jun";
			months[6] = "Jul";
			months[7] = "Aug";
			months[8] = "Sep";
			months[9] = "Oct";
			months[10] = "Nov";
			months[11] = "Dec";

			//console.log($scope.selected_fixture);
		   	$scope.fixture_index = $scope.selected_fixture;
		   	
		   	var count = 0;
		   	var week_found = 0;
		   	$http.get($rootScope.api_path + 'league/' + $scope.league_index)
		   		.success(function(res) {
					//console.log(JSON.stringify(res));
					if(res && res.status=='success') {
						res.data.fixture_info.forEach( function(week) {
							count++;
							if(week.week_no == $scope.selected_fixture) {
								week_found = 1;
								console.log(JSON.stringify(week));

								var dateS = week.start_date.substring(8,10);
								var monthS = week.start_date.substring(5,7);
								var yearS = week.start_date.substring(0,4);
								$scope.game_date = dateS + " " + months[parseInt(monthS)-1] + " " + yearS;

								var hourS = week.start_date.substring(11,13);
								var minuteS = week.start_date.substring(14,16);
								var secondS = week.start_date.substring(17,19);
								$scope.game_time = hourS + ":" + minuteS;

								for (var i = 1; i <= week.game_info.length; i++) {
									$scope.home_team[i] = $scope.teamname.indexOf(week.game_info[i-1].home_team);
									$scope.away_team[i] = $scope.teamname.indexOf(week.game_info[i-1].away_team);
									$scope.game_result[i] = week.game_info[i-1].result;

									//console.log($scope.home_team[i]);
								}
							}			
							if(count==res.data.fixture_info.length && week_found!=1) {
								console.log("empty week");
								$scope.game_date = '';
								$scope.game_time = '';
								for (var i = 1; i <= $rootScope.game_count; i++) {
									$scope.home_team[i] = '';
									$scope.away_team[i] = '';
									$scope.game_result[i] = 0;
								}
							}

						});
						
					}
				});
		}

		$scope.update_league_data = function() {		

			$scope.team_data = [];
			for (var i = 1; i <= $scope.team_cnt; i++) {
				var temp = {};
				
				temp["name"] = $scope.teamname[i];		
				temp["abbr"] = $scope.teamabbr[i];
				var e = document.getElementById("jersey_"+i);
				temp["jersey"] = vm.jersey[i];//e.value;
				if(e.value)
				{
					console.log(e.value);
					if(e.value.indexOf('fakepath') == -1) {
						temp["jersey_name"] = e.value;
					}
					else {
						var arr = e.value.split('\\');
						temp["jersey_name"] = arr[2];
						console.log(arr[2]);
					}
				}				
				else
					temp["jersey_name"] = $scope.jersey_name[i];
				//console.log(e.value);
				$scope.team_data.push(temp);
			}
			console.log($scope.team_data);


			var start_date = $scope.game_date + " " + $scope.game_time;// + " UTC");
			//console.log(start_date);				
				 

			$scope.fixture_data = [];
			for (var i = 1; i <= $scope.game_arry.length; i++) {
				//console.log($scope.home_team[i]);
				var temp = {};
				var e = document.getElementById("home_select_"+i);
				var index = e.options[e.selectedIndex].value
				//temp["home_index"] = index;
				temp["home_team"] = $scope.teamname[index];//e.options[e.selectedIndex].value;
				temp["home_abbr"] = $scope.teamabbr[index];
				e = document.getElementById("jersey_"+index);
				if(e && e.value)
				{
					console.log(e.value);
					if(e.value.indexOf('fakepath') == -1) {
						temp["home_jersey"] = e.value;
					}
					else {
						var arr = e.value.split('\\');
						temp["home_jersey"] = arr[2];
						console.log(arr[2]);
					}
				}
				else
					temp["home_jersey"] = $scope.jersey_name[index];
				e = document.getElementById("away_select_"+i);			
				index = e.options[e.selectedIndex].value
				//temp["away_index"] = index;
				temp["away_team"] = $scope.teamname[index];//e.options[e.selectedIndex].value;
				temp["away_abbr"] = $scope.teamabbr[index];
				e = document.getElementById("jersey_"+index);
				if(e && e.value)
				{
					console.log(e.value);
					if(e.value.indexOf('fakepath') == -1) {
						temp["away_jersey"] = e.value;
					}
					else {
						var arr = e.value.split('\\');
						temp["away_jersey"] = arr[2];
						console.log(arr[2]);
					}
				}
				else
					temp["away_jersey"] = $scope.jersey_name[index];
				//e = document.getElementById("result_select_"+i);				
				temp["result"] = $scope.game_result[i];//e.options[e.selectedIndex].value;

				$scope.fixture_data.push(temp);
			}

			console.log(JSON.stringify($scope.fixture_data));

			$.ajax({
            	type: "POST",
            	url: $rootScope.api_path + 'league/' + $scope.league_index,
            	data: {
            		name: $scope.league_name,
					team_cnt: $scope.team_cnt,
					team_info: $scope.team_data,
					fixture_week: $scope.fixture_index,
					fixture_start: start_date,
					fixture_info: $scope.fixture_data
            	},
            	cache: false,
            	contentType: "application/x-www-form-urlencoded",
            	success: function(result) {
            		alert(JSON.stringify(result));
            	}
            });
		}

	}).
	controller('HomeUSCtrl', function($scope, $rootScope, $element, $state, $http)
	{
		var vm = this;
		vm.jersey = [];

		$scope.league_index = 1;
		$scope.selected_league = 0;
		$scope.fixture_index = 1;
		$scope.selected_fixture = 0;

		$scope.league_name_array = ["NFL", "NBA", "NHL", "MLB", "MLS"];
		$scope.team_arry = [1];
		//$scope.jersey = [];
		$scope.team_cnt = 1;
		$scope.teamabbr = [];
		$scope.teamname = [];
		$scope.jersey_name = [];
		$scope.fixture_week_arry = [];
		for (var i = 1; i <= 40; i++) $scope.fixture_week_arry.push(i)

		$scope.game_arry = [];
		$scope.home_team = [];
		$scope.away_team = [];
		$scope.game_result = [];
		for (var i = 1; i <= $rootScope.game_count; i++) {
			$scope.game_arry.push(i);
			$scope.home_team[i] = $scope.away_team[i] = 1;
			$scope.game_result[i] = 0;
		}

		$scope.fixture_data = [];

		$scope.inc_team_cnt = function() {
			var e = document.getElementById("team_cnt");
			//console.log(e.value);
			$scope.team_cnt = parseInt(e.value) + 1;
			$scope.team_arry = [];
			for (var i = 1; i <= $scope.team_cnt; i++) {
				$scope.team_arry.push(i)
				$scope.home_team[i] = $scope.away_team[i] = 1;
				$scope.game_result[i] = 0;
			}
			//console.log($scope.team_cnt);
		};

		$scope.dec_team_cnt = function() {
			var e = document.getElementById("team_cnt");
			//console.log(e.value);
			if(e.value == '1')
				$scope.team_cnt = 1;
			else
				$scope.team_cnt = parseInt(e.value) - 1;
			$scope.team_arry = [];
			for (var i = 1; i <= $scope.team_cnt; i++) {
				$scope.team_arry.push(i)
				$scope.home_team[i] = $scope.away_team[i] = 1;
				$scope.game_result[i] = 0;
			}
			//console.log($scope.team_cnt);
		};

		$scope.change_league = function() {
			console.log($scope.selected_league);
		   	$scope.league_index = $scope.selected_league;
		   	$scope.league_name = $scope.league_name_array[$scope.selected_league-1];

		   	$http.get($rootScope.US_api_path + 'league/' + $scope.league_index)
		   		.success(function(res) {
					//console.log(JSON.stringify(res));
					if(res && res.status=='success') {
						//$scope.league_name = res.data.name;
						$scope.team_cnt = res.data.team_cnt;
						var e = document.getElementById("team_cnt");
						e.value = res.data.team_cnt;
						$scope.team_arry = [];
						for (var i = 1; i <= $scope.team_cnt; i++) {
							$scope.team_arry.push(i)							
							$scope.teamname[i] = res.data.team_info[i-1].name;
							$scope.teamabbr[i] = res.data.team_info[i-1].abbr;
							var e = document.getElementById("jersey_"+i);
							if(e && e.value)
							e.value = "";							
							vm.jersey[i] = res.data.team_info[i-1].jersey;
							$scope.jersey_name[i] = res.data.team_info[i-1].jersey_name;
							console.log($scope.jersey_name[i]);
						}
					}
					else {
						console.log("none");
						$scope.team_cnt = 1;
						var e = document.getElementById("team_cnt");
						e.value = 1;
						$scope.team_arry = [1];							
						$scope.teamname = [];
						$scope.teamabbr = [];
						vm.jersey = [];
						$scope.jersey_name = [];
					}
				});
		}

		$scope.change_fixture = function() {
			console.log("change_fixture");
			var months = new Array(12);
			months[0] = "Jan";
			months[1] = "Feb";
			months[2] = "Mar";
			months[3] = "Apr";
			months[4] = "May";
			months[5] = "Jun";
			months[6] = "Jul";
			months[7] = "Aug";
			months[8] = "Sep";
			months[9] = "Oct";
			months[10] = "Nov";
			months[11] = "Dec";

			//console.log($scope.selected_fixture);
		   	$scope.fixture_index = $scope.selected_fixture;
		   	
		   	var count = 0;
		   	var week_found = 0;
		   	$http.get($rootScope.US_api_path + 'league/' + $scope.league_index)
		   		.success(function(res) {
					//console.log(JSON.stringify(res));
					if(res && res.status=='success') {
						res.data.fixture_info.forEach( function(week) {
							count++;
							if(week.week_no == $scope.selected_fixture) {
								week_found = 1;
								console.log(JSON.stringify(week));
								console.log(week.start_date);
								//var dateString = week.start_date.substring(0,10);
								//console.log(dateString);
								var dateS = week.start_date.substring(8,10);
								var monthS = week.start_date.substring(5,7);
								var yearS = week.start_date.substring(0,4);
								$scope.game_date = dateS + " " + months[parseInt(monthS)-1] + " " + yearS;

								var hourS = week.start_date.substring(11,13);
								var minuteS = week.start_date.substring(14,16);
								var secondS = week.start_date.substring(17,19);
								$scope.game_time = hourS + ":" + minuteS;
								
								for (var i = 1; i <= week.game_info.length; i++) {
									$scope.home_team[i] = $scope.teamname.indexOf(week.game_info[i-1].home_team);
									$scope.away_team[i] = $scope.teamname.indexOf(week.game_info[i-1].away_team);
									$scope.game_result[i] = week.game_info[i-1].result;

									//console.log($scope.home_team[i]);
								}
							}			
							if(count==res.data.fixture_info.length && week_found!=1) {
								console.log("empty week");
								$scope.game_date = '';
								$scope.game_time = '';
								for (var i = 1; i <= $rootScope.game_count; i++) {
									$scope.home_team[i] = '';
									$scope.away_team[i] = '';
									$scope.game_result[i] = 0;
								}
							}

						});
						
					}
				});
		}

		$scope.update_league_data = function() {		

			$scope.team_data = [];
			for (var i = 1; i <= $scope.team_cnt; i++) {
				var temp = {};
				
				temp["name"] = $scope.teamname[i];		
				temp["abbr"] = $scope.teamabbr[i];
				var e = document.getElementById("jersey_"+i);
				temp["jersey"] = vm.jersey[i];//e.value;
				if(e.value)
				{
					console.log(e.value);
					if(e.value.indexOf('fakepath') == -1) {
						temp["jersey_name"] = e.value;
					}
					else {
						var arr = e.value.split('\\');
						temp["jersey_name"] = arr[2];
						console.log(arr[2]);
					}
				}				
				else
					temp["jersey_name"] = $scope.jersey_name[i];
				//console.log(e.value);
				$scope.team_data.push(temp);
			}
			console.log($scope.team_data);

			//console.log($scope.fixture_index);

			var start_date = $scope.game_date + " " + $scope.game_time;//new Date($scope.game_date + " " + $scope.game_time);// + " UTC");
			//console.log(start_date);				
				 

			$scope.fixture_data = [];
			for (var i = 1; i <= $scope.game_arry.length; i++) {
				//console.log($scope.home_team[i]);
				var temp = {};
				var e = document.getElementById("home_select_"+i);
				var index = e.options[e.selectedIndex].value
				//temp["home_index"] = index;
				temp["home_team"] = $scope.teamname[index];//e.options[e.selectedIndex].value;
				temp["home_abbr"] = $scope.teamabbr[index];
				e = document.getElementById("jersey_"+index);
				if(e && e.value)
				{
					console.log(e.value);
					if(e.value.indexOf('fakepath') == -1) {
						temp["home_jersey"] = e.value;
					}
					else {
						var arr = e.value.split('\\');
						temp["home_jersey"] = arr[2];
						console.log(arr[2]);
					}
				}
				else
					temp["home_jersey"] = $scope.jersey_name[index];
				e = document.getElementById("away_select_"+i);			
				index = e.options[e.selectedIndex].value
				//temp["away_index"] = index;
				temp["away_team"] = $scope.teamname[index];//e.options[e.selectedIndex].value;
				temp["away_abbr"] = $scope.teamabbr[index];
				e = document.getElementById("jersey_"+index);
				if(e && e.value)
				{
					console.log(e.value);
					if(e.value.indexOf('fakepath') == -1) {
						temp["away_jersey"] = e.value;
					}
					else {
						var arr = e.value.split('\\');
						temp["away_jersey"] = arr[2];
						console.log(arr[2]);
					}
				}
				else
					temp["away_jersey"] = $scope.jersey_name[index];
				//e = document.getElementById("result_select_"+i);				
				temp["result"] = $scope.game_result[i];//e.options[e.selectedIndex].value;

				$scope.fixture_data.push(temp);
			}

			console.log(JSON.stringify($scope.fixture_data));

            $.ajax({
            	type: "POST",
            	url: $rootScope.US_api_path + 'league/' + $scope.league_index,
            	data: {
            		name: $scope.league_name,
					team_cnt: $scope.team_cnt,
					team_info: $scope.team_data,
					fixture_week: $scope.fixture_index,
					fixture_start: start_date,
					fixture_info: $scope.fixture_data
            	},
            	cache: false,
            	contentType: "application/x-www-form-urlencoded",
            	success: function(result) {
            		alert(JSON.stringify(result));
            	}
            });
		}

	}).
	controller('PrizeUSCtrl', function($scope, $rootScope, $element, $state, $http)
	{
		$scope.selected_league = 0;
		$scope.jackpot_pool = 0;
		$scope.increase_jackpot = 0;
		$scope.league_pool = 0;
		$scope.increase_league = 0;

		$http.get($rootScope.US_api_path + 'prizepool')
	   		.success(function(res) {
				console.log(JSON.stringify(res));
				if(res.status=='success') {						
					$scope.jackpot_pool = res.prizepool.jackpot_pool;
					$scope.increase_jackpot = res.prizepool.inc_jack_per_ad;
				}
			});

		$scope.change_league = function() {
			console.log($scope.selected_league);
		   	$scope.league_index = $scope.selected_league;
		   
		   	$http.get($rootScope.US_api_path + 'prizepool/' + $scope.league_index)
		   		.success(function(res) {
					console.log(JSON.stringify(res));
					if(res.status=='success') {						
						$scope.league_pool = res.pool;
						$scope.increase_league = res.inc_per_ad;
					}
					else {
						$scope.league_pool = 0;
						$scope.increase_league = 0;
					}
				});
		};

		$scope.update_prizepool_data = function() {
			$http.post($rootScope.US_api_path + 'prizepool/' + $scope.league_index,
			{
				jackpot_pool: $scope.jackpot_pool,
				inc_jack_per_ad: $scope.increase_jackpot,
				league_pool: $scope.league_pool,
				inc_league_per_ad: $scope.increase_league
			}
			).success(function(res) {
				alert(JSON.stringify(res));
			});
		};
	});