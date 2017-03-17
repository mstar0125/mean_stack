'use strict';

var app = angular.module('PuntrServer', [
	'ngCookies',

	'ui.router',
	'ui.bootstrap',

	'oc.lazyLoad',

	'xenon.controllers',
	'xenon.directives',
	'xenon.factory',
	'xenon.services',

	// Added in v1.3
	'FBAngular'
]);

app.run(function($state, $rootScope, $location, authentication)
{
	// Page Loading Overlay
	public_vars.$pageLoadingOverlay = jQuery('.page-loading-overlay');

	jQuery(window).load(function()
	{
		public_vars.$pageLoadingOverlay.addClass('loaded');
	})

	$rootScope.api_path = "http://ec2-34-205-135-243.compute-1.amazonaws.com:8080/api/";
	$rootScope.US_api_path = "http://ec2-34-205-135-243.compute-1.amazonaws.com:8080/api/us/";
	//$rootScope.api_path = "http://localhost:8080/api/";
	//$rootScope.US_api_path = "http://localhost:8080/api/us/";
	$rootScope.game_count = 16;

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		//alert("routeChangeStart" + toState);

		console.log(JSON.stringify(toState));
		
		if (/*toState.url !== 'signup' &&/* /*(toState.url === '/home' || toState.url === '/prize' || toState.url === '/verification' || toState.url === '/withdraw') &&*/ !authentication.isLoggedIn()) {
			console.log("not logged in");
			//$state.go('signin');
			$location.path('signin')
		}
    });
});


app.config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, ASSETS){

	$urlRouterProvider.otherwise('/choose');


	$stateProvider.
		// Main Layout Structure
		state('app', {
			abstract: true,
			url: '/app',
			templateUrl: appHelper.templatePath('layout/app-body'),
			controller: function($rootScope){
				$rootScope.isLoginPage        = false;
				$rootScope.isLightLoginPage   = false;
				$rootScope.isLockscreenPage   = false;
				$rootScope.isMainPage         = true;
			}
		}).
		// Choose App
		state('choose', {
			url: '/choose',
			templateUrl: appHelper.templatePath('dashboards/choose_app'),
			controller: function($rootScope){
				$rootScope.isLoginPage        = true;
				$rootScope.isLightLoginPage   = false;
				$rootScope.isLockscreenPage   = false;
				$rootScope.isMainPage         = false;
				$rootScope.layoutOptions.horizontalMenu.isVisible		= false;
			}
		}).	
		// SignIn
		state('signin', {
			url: '/signin',
			templateUrl: appHelper.templatePath('dashboards/signin'),
			controller: function($rootScope){
				$rootScope.isLoginPage        = true;
				$rootScope.isLightLoginPage   = false;
				$rootScope.isLockscreenPage   = false;
				$rootScope.isMainPage         = false;
			}
		}).		
		// SignUp
		state('signup', {
			url: '/signup',
			templateUrl: appHelper.templatePath('dashboards/signup'),
			controller: function($rootScope){
				$rootScope.isLoginPage        = true;
				$rootScope.isLightLoginPage   = false;
				$rootScope.isLockscreenPage   = false;
				$rootScope.isMainPage         = false;
			}
		}).	
		// Home
		state('app.home', {
			url: '/home',
			templateUrl: appHelper.templatePath('dashboards/home'),
			resolve: {
				datepicker: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.forms.datepicker,
					]);
				},
				timepicker: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.forms.timepicker,
					]);
				}
			}
		}).
		// Prize
		state('app.prize', {
			url: '/prize',
			templateUrl: appHelper.templatePath('dashboards/prize'),
			resolve: {
			}
		}).
		// Age Verification
		state('app.verification', {
			url: '/verification',
			templateUrl: appHelper.templatePath('dashboards/verification'),
			resolve: {
				deps: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.tables.datatables,
					]);
				},
			}
		}).
		// Withdraw Request
		state('app.withdraw', {
			url: '/withdraw',
			templateUrl: appHelper.templatePath('dashboards/withdraw'),
			resolve: {
				deps: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.tables.datatables,
					]);
				},
			}
		}).
		// Home_US
		state('app.homeUS', {
			url: '/homeUS',
			templateUrl: appHelper.templatePath('dashboards/home_US'),
			resolve: {
				datepicker: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.forms.datepicker,
					]);
				},
				timepicker: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.forms.timepicker,
					]);
				}
			}
		}).
		// Prize
		state('app.prizeUS', {
			url: '/prizeUS',
			templateUrl: appHelper.templatePath('dashboards/prize_US'),
			resolve: {
			}
		}).
		// Users
		state('app.users', {
			url: '/users',
			templateUrl: appHelper.templatePath('dashboards/users'),
			resolve: {
				deps: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.tables.datatables,
					]);
				}
			}
		}).
		// FacebookID List
		state('app.fbList', {
			url: '/fbList',
			templateUrl: appHelper.templatePath('dashboards/facebookID'),
			resolve: {
				deps: function($ocLazyLoad){
					return $ocLazyLoad.load([
						ASSETS.tables.datatables,
					]);
				}
			}
		});
});


app.constant('ASSETS', {
	'core': {
		'bootstrap': appHelper.assetPath('js/bootstrap.min.js'), // Some plugins which do not support angular needs this

		'jQueryUI': [
			appHelper.assetPath('js/jquery-ui/jquery-ui.min.js'),
			appHelper.assetPath('js/jquery-ui/jquery-ui.structure.min.css'),
		],

		'moment': appHelper.assetPath('js/moment.min.js'),

		'googleMapsLoader': appHelper.assetPath('app/js/angular-google-maps/load-google-maps.js')
	},

	'charts': {

		'dxGlobalize': appHelper.assetPath('js/devexpress-web-14.1/js/globalize.min.js'),
		'dxCharts': appHelper.assetPath('js/devexpress-web-14.1/js/dx.chartjs.js'),
		'dxVMWorld': appHelper.assetPath('js/devexpress-web-14.1/js/vectormap-data/world.js'),
	},

	'xenonLib': {
		notes: appHelper.assetPath('js/xenon-notes.js'),
	},

	'maps': {

		'vectorMaps': [
			appHelper.assetPath('js/jvectormap/jquery-jvectormap-1.2.2.min.js'),
			appHelper.assetPath('js/jvectormap/regions/jquery-jvectormap-world-mill-en.js'),
			appHelper.assetPath('js/jvectormap/regions/jquery-jvectormap-it-mill-en.js'),
		],
	},

	'icons': {
		'meteocons': appHelper.assetPath('css/fonts/meteocons/css/meteocons.css'),
		'elusive': appHelper.assetPath('css/fonts/elusive/css/elusive.css'),
	},

	'tables': {
		'rwd': appHelper.assetPath('js/rwd-table/js/rwd-table.min.js'),

		'datatables': [
			appHelper.assetPath('js/datatables/dataTables.bootstrap.css'),
			appHelper.assetPath('js/datatables/datatables-angular.js'),
		],

	},

	'forms': {

		'select2': [
			appHelper.assetPath('js/select2/select2.css'),
			appHelper.assetPath('js/select2/select2-bootstrap.css'),

			appHelper.assetPath('js/select2/select2.min.js'),
		],

		'daterangepicker': [
			appHelper.assetPath('js/daterangepicker/daterangepicker-bs3.css'),
			appHelper.assetPath('js/daterangepicker/daterangepicker.js'),
		],

		'colorpicker': appHelper.assetPath('js/colorpicker/bootstrap-colorpicker.min.js'),

		'selectboxit': appHelper.assetPath('js/selectboxit/jquery.selectBoxIt.js'),

		'tagsinput': appHelper.assetPath('js/tagsinput/bootstrap-tagsinput.min.js'),

		'datepicker': appHelper.assetPath('js/datepicker/bootstrap-datepicker.js'),

		'timepicker': appHelper.assetPath('js/timepicker/bootstrap-timepicker.min.js'),

		'inputmask': appHelper.assetPath('js/inputmask/jquery.inputmask.bundle.js'),

		'formWizard': appHelper.assetPath('js/formwizard/jquery.bootstrap.wizard.min.js'),

		'jQueryValidate': appHelper.assetPath('js/jquery-validate/jquery.validate.min.js'),

		'dropzone': [
			appHelper.assetPath('js/dropzone/css/dropzone.css'),
			appHelper.assetPath('js/dropzone/dropzone.min.js'),
		],

		'typeahead': [
			appHelper.assetPath('js/typeahead.bundle.js'),
			appHelper.assetPath('js/handlebars.min.js'),
		],

		'multiSelect': [
			appHelper.assetPath('js/multiselect/css/multi-select.css'),
			appHelper.assetPath('js/multiselect/js/jquery.multi-select.js'),
		],

		'icheck': [
			appHelper.assetPath('js/icheck/skins/all.css'),
			appHelper.assetPath('js/icheck/icheck.min.js'),
		],

		'bootstrapWysihtml5': [
			appHelper.assetPath('js/wysihtml5/src/bootstrap-wysihtml5.css'),
			appHelper.assetPath('js/wysihtml5/wysihtml5-angular.js')
		],
	},

	'uikit': {
		'base': [
			appHelper.assetPath('js/uikit/uikit.css'),
			appHelper.assetPath('js/uikit/css/addons/uikit.almost-flat.addons.min.css'),
			appHelper.assetPath('js/uikit/js/uikit.min.js'),
		],

		'codemirror': [
			appHelper.assetPath('js/uikit/vendor/codemirror/codemirror.js'),
			appHelper.assetPath('js/uikit/vendor/codemirror/codemirror.css'),
		],

		'marked': appHelper.assetPath('js/uikit/vendor/marked.js'),
		'htmleditor': appHelper.assetPath('js/uikit/js/addons/htmleditor.min.js'),
		'nestable': appHelper.assetPath('js/uikit/js/addons/nestable.min.js'),
	},

	'extra': {
		'tocify': appHelper.assetPath('js/tocify/jquery.tocify.min.js'),

		'toastr': appHelper.assetPath('js/toastr/toastr.min.js'),

		'fullCalendar': [
			appHelper.assetPath('js/fullcalendar/fullcalendar.min.css'),
			appHelper.assetPath('js/fullcalendar/fullcalendar.min.js'),
		],

		'cropper': [
			appHelper.assetPath('js/cropper/cropper.min.js'),
			appHelper.assetPath('js/cropper/cropper.min.css'),
		]
	}
});

app.directive('ngDraggable', function($document) {
  return {
    restrict: 'A',
    scope: {
      dragOptions: '=ngDraggable'
    },
    link: function(scope, elem, attr) {
      var startX, startY, x = 0, y = 0,
          start, stop, drag, container;

      var width  = elem[0].offsetWidth,
          height = elem[0].offsetHeight;

      // Obtain drag options
      if (scope.dragOptions) {
        start  = scope.dragOptions.start;
        drag   = scope.dragOptions.drag;
        stop   = scope.dragOptions.stop;
        var id = scope.dragOptions.container;
        if (id) {
            container = document.getElementById(id).getBoundingClientRect();
        }
      }

      // Bind mousedown event
      elem.on('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX - elem[0].offsetLeft;
        startY = e.clientY - elem[0].offsetTop;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        if (start) start(e, elem[0]);
      });

      // Handle drag event
      function mousemove(e) {
        y = e.clientY - startY;
        x = e.clientX- startX;
        setPosition();
        if (drag) drag(e, elem[0]);
      }

      // Unbind drag events
      function mouseup(e) {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        if (stop) stop(e, elem[0]);
      }

      // Move element, within container if provided
      function setPosition() {
      	/*
        if (container) {
          if (x < container.left) {
            x = container.left;
          } else if (x > container.right - width) {
            x = container.right - width;
          }
          if (y < container.top) {
            y = container.top;
          } else if (y > container.bottom - height) {
            y = container.bottom - height;
          }
        }
		*/
        elem.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }
    }
  }

})