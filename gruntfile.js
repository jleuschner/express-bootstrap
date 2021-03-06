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
        laxbreak: true,
        evil:true 
      },
      all: [
        'routes/*.js',
        'public/js/*.js',
        'public/js/dokusys/*.js',
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
              'public/bower_components/iCheck/icheck.min.js',
              'public/bower_components/chosen/chosen.jquery.min.js',
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
        src: ['public/js/templates/cruds.js'],
        dest: 'public/dist/js/templates/cruds.min.js'
        },
      dokusys:
        {
        src: ['public/js/dokusys/dokusys.js'],
        dest: 'public/dist/js/dokusys/dokusys.min.js'
        },
      iodevices:
        {
        src: ['public/js/io/devices.js'],
        dest: 'public/dist/js/io/devices.min.js'
        },
      iotypes:
        {
        src: ['public/js/io/types.js'],
        dest: 'public/dist/js/io/types.min.js'
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
                  'public/bower_components/iCheck/skins/flat/blue.css',
                  'public/bower_components/chosen-bootstrap/chosen.bootstrap.min.css',
                  'public/css/*.css'
              ],
          'public/dist/css/dokusys/dokusys.min.css': [
                  'public/css/dokusys/*.css'
          ],
          'public/dist/css/templates/style.min.css': [
                  'public/css/templates/*.css'
          ],
          'public/dist/css/io/devices.min.css': [
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
          },
          {
            expand: true,
            cwd: 'public/bower_components/chosen-bootstrap',
            src: '*.png',
            dest: 'public/dist/css/'
          },
          {
            expand: true,
            cwd: 'public/bower_components/iCheck/skins/flat/',
            src: 'blue*.png',
            dest: 'public/dist/css/'
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