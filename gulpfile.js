var gulp            = require('gulp'),
    bower           = require('gulp-bower'),
    sequence        = require('gulp-sequence'),
    concat          = require('gulp-concat'),
    sass            = require('gulp-sass'),
    prefixer        = require('gulp-autoprefixer');

gulp.task('bower', function()
{
    return bower();
});

gulp.task('sass', function ()
{
    return gulp
        .src('./sass/base.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(prefixer({
            browsers: ['last 3 versions', 'IE 9'],
            cascade: false
        }))
        .pipe(concat('gallery.css'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('default', function(callback)
{
    sequence('bower', 'sass')(callback)
});
