module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        node: true,
        jquery: true,
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        forin: true,
        undef:true,
        unused: true,
        laxbreak: true
      },
      all: [
        'routes/*.js',
        'public/js/*.js',
        //'public/js/dokusys/*.js',
        'public/js/io/*.js',
        'public/js/templates/*.js'
        ]
    },
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yy-mm-dd") %> */\n'
      },
      build: {
        src: ['public/bower_components/jquery/dist/jquery.min.js',
              'public/bower_components/bootstrap/dist/js/bootstrap.min.js',
              'public/bower_components/bootbox/bootbox.js',
              'public/bower_components/bootstrapvalidator/dist/js/bootstrapValidator.min.js',
              'public/bower_components/bootstrapvalidator/dist/js/language/de_DE.js',
              'public/bower_components/summernote/dist/summernote.min.js',
              'public/bower_components/jquery-ui/ui/minified/widget.min.js',
              'public/bower_components/jquery-ui/ui/minified/effect.min.js',
              'public/bower_components/jquery-ui/ui/minified/effect-slide.min.js',
              'public/bower_components/jQuery-Mask-Plugin/dist/jquery.mask.min.js',
              'public/bower_components/tagsinput/dist/bootstrap-tagsinput.min.js',
              'public/js/*.js'
              ],
        dest: '_tmp/j.js'
      }

    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yy-mm-dd") %> */\n'
      },
      build: 
        {
        src: ['_tmp/j.js'],
        dest: 'public/dist/js/j.min.js'
        },
      templates:
        {
        src: ['public/js/templates/crud.js'],
        dest: 'public/dist/js/templates/crud.min.js'
        },
      dokusys:
        {
        src: ['public/js/dokusys/dokusys.js'],
        dest: 'public/dist/js/dokusys/dokusys.min.js'
        },
      iodevice:
        {
        src: ['public/js/io/iodevice.js'],
        dest: 'public/dist/js/io/iodevice.min.js'
        }

    },
    cssmin: {
      combine: {
        files: {
          'public/dist/css/j.css': [
                  //'public/bower_components/bootstrap/dist/css/bootstrap.min.css',
                  'public/bower_components/bootstrap/dist/css/spacelab.min.css',
                  'public/bower_components/bootstrapvalidator/dist/css/bootstrapValidator.min.css',
                  'public/bower_components/fontawesome/css/font-awesome.min.css',
                  'public/bower_components/summernote/dist/summernote.css',
                  'public/bower_components/tagsinput/dist/bootstrap-tagsinput.css',
                  'public/css/*.css'
              ],
          'public/dist/css/dokusys/dokusys.min.css': [
                  'public/css/dokusys/*.css'
          ],
          'public/dist/css/templates/style.min.css': [
                  'public/css/templates/*.css'
          ],
          'public/dist/css/io/iodevice.min.css': [
                  'public/css/io/*.css'
          ]
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'public/bower_components/bootstrap/fonts',
            src: '*',
            dest: 'public/dist/fonts/'
          },
          {
            expand: true,
            cwd: 'public/bower_components/fontawesome/fonts',
            src: '*',
            dest: 'public/dist/fonts/'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('build', ['jshint','concat','uglify','cssmin','copy']);
  grunt.registerTask('default', ['jshint']);

};