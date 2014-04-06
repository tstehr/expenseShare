module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		// Clean
		clean: {
			// clean:release removed the dist directory
			release: [ 'static_dist' ]
		},

		useminPrepare: {
			html: 'static/index.html',
			options: {
				dest: 'static_dist/'
			}
		},

		concat: {
			// dist configuration is provided by useminPrepare
			dist: {}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			// dist configuration is provided by useminPrepare
			dist: {}
		},

		cssmin: {

		},

		copy: {
			// copy:release copies all html and image files to dist
			// preserving the structure
			release: {
				files: [
					{
						expand: true,
						cwd: 'static',
						src: [
							'*.html'
						],
						dest: 'static_dist'
					}
				]
			}
		},

		filerev: {
			options: {
				encoding: 'utf8',
				algorithm: 'md5',
				length: 20
			},
			release: {
				// filerev:release hashes(md5) all assets (images, js and css )
				// in dist directory
				files: [{
					src: [
						'static_dist/js/*.js',
						'static_dist/css/*.css',
					]
				}]
			}
		},

		usemin: {
			html: ['static_dist/*.html'],
			css: ['static_dist/css/*.css'],
			options: {
				assetsDirs: ['static_dist']
			}
		},

		htmlmin: { 
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: { 
					'static_dist/index.html': 'static_dist/index.html'
				}
			}
		}
	});

	// Default task(s).
	grunt.registerTask('default', [
		'clean',
		'useminPrepare',
		'concat', 
		'uglify',
		'cssmin',
		'copy',
		'filerev',
		'usemin',
		'htmlmin'
	]);

};