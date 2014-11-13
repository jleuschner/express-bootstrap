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
        unused: true
      },
      all: [
        'routes/*.js',
        'public/javascripts/test.js'
        ]
    },
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yy-mm-dd") %> */\n'
      },
      build: {
        src: ['public/bower_components/jquery/dist/jquery.min.js',
              'public/bower_components/bootstrap/dist/js/bootstrap.min.js'
              ],
        dest: 'public/js/j.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yy-mm-dd") %> */\n'
      },
      build: {
        src: ['public/js/j.js'],
        dest: 'public/js/j.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['jshint','concat','uglify']);
  grunt.registerTask('default', ['jshint']);

};