module.exports = function(grunt){
  'use strict';
  grunt.initConfig({
    browserify:{
      browser:{
        files:{
          'dist/indicia-mobile.js': ['./indicia-mobile.js']
        },
        options:{
          ignore: [require.resolve('form-data'),'xmlhttprequest'],
          browserifyOptions:{
            standalone: 'IndiciaMobile'
          }
        }
      }
    },
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
      files: ['./indicia-mobile.js'],
      tasks: ['build']
    },
    jshint:{
      all:{
        src: ['./indicia-mobile.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test',['mochaTest']);
  grunt.registerTask('build',['jshint','test','browserify','uglify']);
  grunt.registerTask('default',['watch']);
};
