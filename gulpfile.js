// plugins for development
const	gulp = require('gulp'),
		rimraf = require('rimraf'),
		rename = require('gulp-rename'),
		pug = require('gulp-pug'),
		sass = require('gulp-sass'),
		notify = require('gulp-notify'),
		inlineimage = require('gulp-inline-image'),
		prefix = require('gulp-autoprefixer'),
		plumber = require('gulp-plumber'),
		dirSync = require('gulp-directory-sync'),
		browserSync = require('browser-sync'),
		reload = browserSync.reload,
		checkFilesize = require("gulp-check-filesize"),
		prettify = require('gulp-jsbeautifier');
// plugins for rollup
const	rollup = require('rollup-stream'),
		source = require('vinyl-source-stream'),
		buffer = require('vinyl-buffer'),
		sourcemaps = require('gulp-sourcemaps'),
		babel = require('rollup-plugin-babel'),
		commonJs = require('rollup-plugin-commonjs'),
		resolveNodeModules = require('rollup-plugin-node-resolve');
// plugins for build
const 	purify = require('gulp-purifycss'),
		uglify = require('gulp-uglify'),
		imagemin = require('gulp-imagemin'),
		pngquant = require('imagemin-pngquant'),
		uncss = require('gulp-uncss'),
		cssmin = require('gulp-minify-css'),
		csso = require('gulp-csso');
// plugins for tests
const   mocha = require('gulp-mocha');
// jasmine test
const Jasmine = require('jasmine'),
      jasmine = new Jasmine(),
      jasmineConfig = require('./configs/jasmine/jasmine.json');
// jasmine reporter
const JasmineConsoleReporter = require('jasmine-console-reporter'),
      jasmineReporterConfig = require('./configs/jasmine/jasmineReporter.json'),
      reporter = new JasmineConsoleReporter(jasmineReporterConfig);
// plugins for validations
const   eslint = require('gulp-eslint'),
	 	html5Lint = require('gulp-html5-lint');
// plugins for documentation
const 	jsdoc = require('gulp-jsdoc3');
//-----------------------------------------------------Js
/* cjs - nodejs
 * iife - browser
 *  */
const path = require('./configs/path.json');
//------------------------------Babel
const babelConfig = require(path.configs.babel);
//------------------------------JsDoc
const jsDocConfig = require(path.configs.jsDoc);
//------------------------------Livereload
const configServerLivereload = require(path.configs.serverLive);
//------------------------------Tunnel
const configServerTunnel= require(path.configs.serverTunnel);
//------------------------------Bundler (RoolUp)
//------------------------------Config rollup
const nameMainSrcfile = 'index.js',
	  typeModules = 'cjs',
	  sourceMap = true;
const rollupJS = (inputFile, options) => {
		return () => {
		return rollup({
			input: options.basePath + inputFile,
			format: options.format,
			sourcemap: options.sourcemap,
			plugins: [
			babel(babelConfig),
			resolveNodeModules(),
			commonJs(),
			]
		})
		.pipe(source(inputFile, options.basePath))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(options.distPath));
	};
};
//-----------------------------------------------------Errors
//------------------------------Messages
const 	messageBuildHtml = 'Build prodaction version html',
		messageBuildCss = 'Build prodaction version css',
		messageBuildJs = 'Build prodaction version js',
		messageBuildImage = 'Build prodaction image',
		messageBuildFonts = 'Build fonts on prodaction',
		messageValidation = 'Validation started',
		messageTesting = 'Start the tests';
//------------------------------Error handler
const onError = function (err) {
  notify.onError({
    title: 'Gulp',
    subtitle: 'Ahtung!',
    message: 'Error: <%= error.message %>',
  })(err);
  this.emit('end');
};
//-------------------------------------------------Servers
//------------------------------Livepreload
gulp.task('server', function () {
    browserSync(configServerTunnel);
});
//------------------------------Local Server
gulp.task('browser-sync', function () {
	browserSync(configServerLivereload);
});
//-------------------------------------------------Watchers
gulp.task('watch', function () {
	gulp.watch(path.watch.pug, ['pug']);
	gulp.watch(path.watch.scss, ['sass']);
	gulp.watch(path.watch.js, ['js']);
	gulp.watch(path.watch.images + '**/*', ['imageSync']);
	gulp.watch(path.watch.fonts + '**/*',  ['fontsSync']);
});
//-------------------------------------------------Synchronization
//Таски для синхронизации папок проекта между собой:
gulp.task('imageSync', function () {
	return gulp.src('')
		.pipe(plumber())
		.pipe(dirSync(path.src.images, path.build.images, {printSummary: true}))
		.pipe(browserSync.stream());
});

gulp.task('fontsSync', function () {
	return gulp.src('')
		.pipe(plumber())
		.pipe(dirSync(path.src.fonts, path.build.fonts, {printSummary: true}))
		.pipe(browserSync.stream());
});

// gulp.task('jsSync', function () {
// 	return gulp.src(build.js + '/**/*.js')
// 		.pipe(plumber())
// 		.pipe(gulp.dest(outputDir + 'js/'))
// 		.pipe(browserSync.stream());
// });
//-----------------------------------------------------Compilers
// pug > html
gulp.task('pug', function () {
	gulp.src(path.src.pug)
		.pipe(plumber({errorHandler: onError}))
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest(path.build.html))			  // output html
        .pipe(reload({stream: true}));
});
// scss > сss
gulp.task('sass', function () {
	gulp.src(path.src.scss)
		.pipe(sass())
		.pipe(inlineimage())
		.pipe(plumber({errorHandler: onError}))
		.pipe(prefix('last 3 versions'))
		.pipe(gulp.dest(path.build.css))	// output css
        .pipe(reload({stream: true}));
});
//js(es6) > js(es3)
gulp.task('js', rollupJS(nameMainSrcfile, {
	basePath: path.src.js,
	format: typeModules,
	distPath: path.build.js,
	sourcemap: sourceMap
  }));
//------------------------------------------------Building prodaction
//------------------------------clean folder `build`
// gulp.task('cleanBuildDir', function (cb) {
// 	rimraf(path.build.html, cb);
// });
// images
gulp.task('imgBuild', function () {
	return gulp.src(path.build.image)
		.pipe(notify({ message: messageBuildImage, onLast: true  }))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(path.prodaction.image))
});
// fonts
gulp.task('fontsBuild', function () {
	return gulp.src(path.build.fonts)
		.pipe(notify({ message: messageBuildFonts, onLast: true  }))
		.pipe(gulp.dest(path.prodaction.fonts))
});
// html
gulp.task('htmlBuild', function () {
	gulp.src(path.build.html + '**/*.html')
		.pipe(notify({ message: messageBuildHtml, onLast: true  }))
		.pipe(prettify.reporter())                        //  указывает имя и формат файлов для prettify
		.pipe(checkFilesize())                            //  указывает размер файла после обработки
		.pipe(gulp.dest(path.prodaction.html))            //  Выплюнем их в папку prodaction
		.pipe(reload({stream: true}))                     //  И перезагрузим наш сервер для обновлений
	return gulp.src(path.prodaction.html)              	  //  нужно указывать уже файл после beatify прогона
		.pipe(prettify.validate())                        //  если есть ошибка ее выведет репортер и скажет что сделать!
		.pipe(prettify.reporter());

});
// minify js
gulp.task('jsBuild', function () {
	return gulp.src(path.build.js + '**/*.js')
		.pipe(notify({ message: messageBuildJs, onLast: true  }))
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest(path.prodaction.js))
	});
// minify css
gulp.task('cssBuild', function () {
	// return gulp.src(path.build.css)
		// .pipe(purify([outputDir + 'js/**/*', outputDir + '**/*.html'])) // очищение ??
	gulp.src(path.build.css)
		.pipe(notify({ message: messageBuildCss, onLast: true  }))
		.pipe(plumber())
	return gulp.src(path.build.css)
        .pipe(uncss({
           html: [path.prodaction.uncssHTML]
        }))
		.pipe(rename({suffix: '.min'}))               //  Добавляем суффикс .min  к сжатому
		.pipe(csso())
		.pipe(checkFilesize())                            //  указывает размер файла после обработки
		.pipe(gulp.dest(path.prodaction.css))
	return gulp.src(path.prodaction.css)             //  нужно указывать уже файл после beatify прогона
		.pipe(prettify.validate())                        //  если есть ошибка ее выведет репортер и скажет что сделать!
		.pipe(prettify.reporter());
});

//------------------------------------------------Validation
//------------------------------Html
gulp.task('validation:html', function () {
	return gulp.src(buildDir + '**/*.html')
		.pipe(notify({ message: messageValidation, onLast: true  }))
		.pipe(html5Lint());
});
//------------------------------Js
gulp.task('validation:js', () => {
  return gulp.src([path.validation.js,'!node_modules/**'])
    .pipe(eslint({
      fix: true       // редактирует ошибки если может
    }))
    .pipe(eslint.format())
    gulp.dest(jsFixedLinterOutput)
    .pipe(eslint.results(results => {
        console.log(`Total Results: ${results.length}`);
        console.log(`Total Warnings: ${results.warningCount}`);
        console.log(`Total Errors: ${results.errorCount}`);
    }))
});
//------------------------------------------------Testing
//------------------------------Mocha
gulp.task('test:mocha', () =>
    gulp.src(path.tests.mocha) //
    	.pipe(notify({ message: messageTesting, onLast: true  }))
        .pipe(mocha())
);
//------------------------------Jasmine
gulp.task('test:jasmine', () => {
  jasmine.loadConfig(jasmineConfig);
  jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
  jasmine.env.clearReporters();
  jasmine.addReporter(reporter);
  jasmine.execute();
});
//------------------------------------------------Documentation
//------------------------------JsDoc
gulp.task('jsDoc', function (cb) {
    gulp.src([path.docs.jsDoc, `${path.build.js}index.js`], {read: false})
    .pipe(jsdoc(jsDocConfig, cb));
});
/******************************************************************

							TASKS

*******************************************************************/
// for development
gulp.task('default', ['pug', 'sass', 'js', 'imageSync', 'fontsSync', 'watch', 'browser-sync']);
// for production
gulp.task('build', ['fontsBuild', 'htmlBuild', 'jsBuild', 'cssBuild'] ); //,
gulp.task('validation', ['validation:html', 'validation:js']);
// добавить тесты,документацию

// test:unit - юнит тесты
// test:e2e - 2e2 тесты

// "gulp documentation" - запуск генерации всех типов документации
// documentation:bundleReadme - сборка реадме по сусекам ?? Или на прямую использовать апи моего модуля

// documentation:license - генерация лицензии ?? Или на прямую использовать апи моего модуля
//     // "test": "gulp test",
