/*
 * Gulp Pure Start © 2017 – 2019, Nikita Mihalyov <nikita.mihalyov@gmail.com>
 * ISC Licensed
 * v1.2.0
 */

'use strict';

let dev = './dev',     // рабочая среда проекта
	build = './build', // рабочий билд
	prod = './prod';   // билд в продакшен

// Подключаем все необходимые плагины
const gulp       = require('gulp'),                       // Сам сборщик Gulp
	scss         = require('gulp-sass'),                  // Пакет компиляции scss/SCSS
	mmq          = require('gulp-merge-media-queries'),   // Плагин, соединющий медиа-запросы
	pug          = require('gulp-pug'),                   // Пакет компиляции Pug (бывш. Jade)
	browserSync  = require('browser-sync'),               // Запуск локального сервера
	babel        = require('gulp-babel'),                 // Транспиляция ES6 в ES5
	sourcemaps   = require('gulp-sourcemaps'),            // Плагин, создающий source maps к файлам
	uglify       = require('gulp-uglify'),                // Пакет минификации файлов JavaScript
	cssnano      = require('gulp-cssnano'),               // Пакет минификации файлов CSS
	rename       = require('gulp-rename'),                // Переименовывание файлов
	critical     = require('critical').stream,            // Генерирует критические стили для более быстрой загрузки страницы
	del          = require('del'),                        // Удаление файлов директории
	imagemin     = require('gulp-imagemin'),              // Пакет минификации изображений (в зависимостях также идут дополнительные пакеты)
	cache        = require('gulp-cache'),                 // Работа с кэшом
	autoprefixer = require('gulp-autoprefixer'),          // Пакет расстановки вендорных перфиксов
	plumber      = require('gulp-plumber'),               // Предотвращает разрыв pipe'ов, вызванных ошибками gulp-плагинов
	notify       = require('gulp-notify'),                // Выводит уведомления
	importFile   = require('gulp-file-include'),          // Импорт файлов (@@include('path/to/file'))
	cheerio = require('gulp-cheerio'),
	replace = require('gulp-replace'),
	sprite  = require('gulp-svg-sprite'),
	svgmin  = require('gulp-svgmin');

	gulp.task('svg', function() {
    return gulp.src(`${dev}/img/sprite/*.svg`)
      .pipe(svgmin({
        js2svg: {
          pretty: true
        }
      }))
      .pipe(cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true }
      }))
      .pipe(replace('&gt;', '>'))
      .pipe(sprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg"
          }
        }
      }))
      .pipe(gulp.dest(`${build}/img/sprite`));
  });



// Компилируем scss (можно изменить на SCSS) в CSS с минификацией и добавляем вендорные префиксы
gulp.task('scss', () => {
	return gulp.src(`${dev}/scss/style.scss`)   // В этом файле(-ах) хранятся основные стили, остальные следует импортировать в него
	.pipe(sourcemaps.init())                    // инциализация sourcemap'ов
	.pipe(scss({
		outputStyle: ':nested'                  // компиляции в CSS с отступами
	}))
	.on('error', notify.onError({
		title: 'scss',
		message: '<%= error.message %>'         // вывод сообщения об ошибке
	}))
	.pipe(autoprefixer(['last 15 versions', '> 1%'], {cascade: false}))    // настройка автоматической подстановки вендорных префиксов
	.pipe(cssnano())                            // минификация стилей
	.pipe(rename({
		suffix: '.min'                          // переименовываем минифицированный(-ые) файл(-ы) стилей
	}))
	.pipe(sourcemaps.write())                   // запись sourcemap'ов
	.pipe(gulp.dest(`${build}/css`))            // путь вывода файла(-ов)
	.pipe(browserSync.reload({
		stream: true                            // инжектим стили без перезагрузки страницы
	}));
});

gulp.task('scssLibs', () => {
	return gulp.src(`${dev}/scss/libs.scss`)   // В этом файле(-ах) хранятся импортируемые библиотеки
	.pipe(scss({
		outputStyle: ':nested'                  // компиляции в CSS с отступами
	}))
	.pipe(autoprefixer(['last 15 versions', '> 1%'], {cascade: false}))    // настройка автоматической подстановки вендорных префиксов
	.pipe(cssnano())                            // минификация стилей
	.pipe(rename({
		suffix: '.min'                          // переименовываем минифицированный(-ые) файл(-ы) стилей
	}))
	.pipe(gulp.dest(`${build}/css`))            // путь вывода файла(-ов)
	.pipe(browserSync.reload({
		stream: true                            // инжектим стили без перезагрузки страницы
	}));
});

// Таск scss для продакшена, без sourcemap'ов
gulp.task('_scss',  () => {
	return gulp.src(`${dev}/scss/style.scss`)
	.pipe(scss())
	.pipe(autoprefixer(['last 15 versions', '> 1%'], {cascade: false}))
	.pipe(mmq())
	.pipe(cssnano())
	.pipe(rename({
		suffix: '.min'
	}))
	.pipe(gulp.dest(`${prod}/css`));
});

// Таск scssLibs для продакшена, без sourcemap'ов
gulp.task('_scssLibs',  () => {
	return gulp.src(`${dev}/scss/libs.scss`)
	.pipe(scss())
	.pipe(autoprefixer(['last 15 versions', '> 1%'], {cascade: false}))
	.pipe(mmq())
	.pipe(cssnano())
	.pipe(rename({
		suffix: '.min'
	}))
	.pipe(gulp.dest(`${prod}/css`));
});

// Компилируем Pug (Jade) в HTML без его минификации
gulp.task('pug',  () => {
	return gulp.src(`${dev}/pug/*.pug`)         // файл(-ы) pug препроцессора
	.pipe(pug({
		pretty: true                            // компилируем pug в html без сжатия
	}))
	.on('error', notify.onError({
		title: 'PUG',
		message: '<%= error.message %>'         // выводим сообщение об ошибке
	}))
	.pipe(gulp.dest(`${build}`))                // путь вывода html файла(-ов)
	.pipe(browserSync.reload({
		stream: true                            // перезагружаем страницу
	}));
});

// Таск PUG для продакшена - генерация критических стилей
gulp.task('_pug',  () => {
	return gulp.src(`${dev}/pug/*.pug`)
	.pipe(pug({
		pretty: true
	}))
	.pipe(critical({                            // генерируем критический CSS для быстрой загрузки страниц
		base: `${build}/`,                      // из всех наших файлов
		minify: true,                           // с минификацией
		inline: true,
		width: 1920,
		height: 1280,
		css: [`${build}/css/style.min.css`, `${build}/css/libs.min.css` ]     // путь к вашему основному файлу стилей, или несколько файлов через звпятую
	}))
	.on('error', notify.onError({
		title: 'PUG',
		message: '<%= error.message %>'
	}))
	.pipe(gulp.dest(`${prod}`));
});

// Подключаем JS файлы результирующего файла common.js, конкатенируем и минифицируем
gulp.task('scripts', () => {
	return gulp.src(`${dev}/js/common.js`)      // основной(-ые) файл(-ы) наших сценариев
	.pipe(plumber({
		errorHandler: notify.onError({
			title: 'JavaScript',
			message: '<%= error.message %>'     // выводим сообщение об ошибке
		})
	}))
	.pipe(importFile({                          //
		prefix: '@',                           // импортим все файлы, описанные в результируещем js
		basepath: '@file'                       //
	}))
	.pipe(sourcemaps.init())                    // инициализация sourcemaps'ов
	.pipe(babel())                              // транспиляция ES6 в ES5
	.pipe(uglify())                             // минификация JS
	.pipe(rename({
		suffix: '.min'                          // переименовываем сжатый файл
	}))
	.pipe(sourcemaps.write())                   // запись sourcemap'ов
	.pipe(gulp.dest(`${build}/js`))             // путь вывода файлов
	.pipe(browserSync.reload({
		stream: true                            // перезагружаем страницу
	}));
});

// Таск scripts для продакшена, без sourcemap'ов
gulp.task('_scripts', () => {
	return gulp.src(`${dev}/js/common.js`)
	.pipe(importFile({
		prefix: '@',
		basepath: '@file'
	}))
	.pipe(babel())
	.pipe(uglify())
	.pipe(rename({
		suffix: '.min'
	}))
	.pipe(gulp.dest(`${prod}/js`))
});

// Подключаем JS файлы бибилотек, установленные bower'ом, конкатенируем их и минифицируем
gulp.task('jsLibs', () => {
	return gulp.src(`${dev}/js/libs.js`)        // файл, в который импортируются наши библиотеки
	.pipe(plumber({
		errorHandler: notify.onError({
			title: 'JavaScript',
			message: '<%= error.message %>'     // выводим сообщение об ошибке
		})
	}))
	.pipe(importFile({                          //
		prefix: '@',                           // импортим все файлы, описанные в результируещем js
		basepath: '@file'                       //
	}))
	.pipe(uglify())                             // минификация JS
	.pipe(rename({
		suffix: '.min'                          // переименовываем сжатый файл
	}))
	.pipe(gulp.dest(`${build}/js`))             // путь вывода файлов
	.pipe(browserSync.reload({
		stream: true                            // перезагружаем страницу
	}));
});

// Минифицируем изображения и кидаем их в кэш
gulp.task('img', () => {
	return gulp.src(`${dev}/img/**/*`)          // путь ко всем изображениям
	.pipe(cache(imagemin([                      // сжатие изображений без потери качества
		imagemin.gifsicle(),                    // сжатие gif
		imagemin.mozjpeg(),                    // сжатие jpeg
		imagemin.optipng()])))                  // сжатие png
	.pipe(gulp.dest(`${build}/img`));           // путь вывода файлов
});

// Переносим шрифты
gulp.task('fonts', () => {
	return gulp.src(`${dev}/fonts/**/*`)
	.pipe(gulp.dest(`${build}/fonts`));
});

// Запускаем наш локальный сервер
gulp.task('browser-sync', () => {
	browserSync({
		server: {
			baseDir: `${build}`                 // корневая папка для запускаемого проекта
		},
		notify: false                           // отключаем стандартные уведомления browsersync
	});
});

// Переносим файл манифеста в папку build
gulp.task('manifest', () => {
	return gulp.src(`${dev}/manifest.json`)
	.pipe(gulp.dest(`${build}/`));
});

// Следим за изменениями файлов и вывполняем соответствующие таски
gulp.task('default', gulp.parallel('svg', 'scss', 'scssLibs', 'img', 'pug', 'jsLibs', 'scripts', 'fonts', 'manifest', 'browser-sync', () => {
	gulp.watch(`${dev}/img/sprite/*.svg`, gulp.series('svg'));
	// стили
	gulp.watch(`${dev}/**/*.scss`, gulp.series('scss'));

	gulp.watch(`${dev}/**/*.scss`, gulp.series('scssLibs'));
	// разметка
	gulp.watch(`${dev}/**/*.pug`, gulp.series('pug'));
	// скрипты
	gulp.watch(`${dev}/**/*.js`, gulp.series('scripts'));
	// скрипты библиотек
	gulp.watch(`${dev}/js/libs.js`, gulp.series('jsLibs'));
	// шрифты
	gulp.watch(`${dev}/fonts/**/*`, gulp.series('fonts'));
	// изображения
	gulp.watch(`${dev}/img/**/*`, gulp.series('img'));
	// манифест
	gulp.watch(`${dev}/manifest.json`, gulp.series('manifest'));
}));

// Удаляем все лишние файлы: '.gitkeep', 'changelog.md' и 'readme.md'
gulp.task('misc', async () => {
	return del.sync(['**/.gitkeep', 'changelog.md', 'readme.md']);
});

// Очищаем директорию продакшен билда
gulp.task('clean', async () => {
	return del.sync(`${prod}/**/*`);
});

// Чистим кэш изображений (вообще весь кэш)
gulp.task('clear', async () => {
	return cache.clearAll();
});

// Собираем наш билд в продакшен
gulp.task('prod', gulp.series('clean', 'img', '_scss', '_scssLibs', '_pug', 'jsLibs', '_scripts', async () => {
	// Собираем JS-библиотеки
	gulp.src(`${build}/js/libs.min.js`)
	.pipe(gulp.dest(`${prod}/js`));

	// Собираем шрифты
	gulp.src(`${dev}/fonts/**/*`)
	.pipe(gulp.dest(`${prod}/fonts`));

	// Собираем изображения
	gulp.src(`${build}/img/**/*`)
	.pipe(gulp.dest(`${prod}/img`));

	// Собираем manifest.json
	gulp.src(`${dev}/manifest.json`)
	.pipe(gulp.dest(`${prod}/`));
}));