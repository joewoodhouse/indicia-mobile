module.exports = function(grunt){
  'use strict';
  grunt.initConfig({
    uglify:{
      browser:{
        files:{
          'dist/indicia-mobile.min.js': ['dist/indicia-mobile.js']
        }
      }
    },
    mochaTest:{
      test:{
        src: ['tests/bootstrap.js','tests/**/*.spec.js']
      }
    },
    watch:{
      files: ['./src/*.js'],
      tasks: ['build']
    },
    jshint:{
      all:{
        src: ['./indicia-mobile.js']
      }
    },
    concat:{
      dist:{
        src: ['src/*.js'],
        dest: 'dist/indicia-mobile.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test',['mochaTest']);
  grunt.registerTask('dist',['concat','uglify']);
  grunt.registerTask('build',['jshint','dist']);
  grunt.registerTask('default',['watch']);
};
