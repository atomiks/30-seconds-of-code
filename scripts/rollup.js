import babel from 'rollup-plugin-babel'
import minify from 'rollup-plugin-babel-minify'

export default {
  input: './imports.js',
  output: {
    file: './lib/Snippet.js',
    format: 'umd',
    name: 'Snippet'
  },
  externalHelpers: true,
  plugins: [
    babel({
      presets: ['es2015-rollup'],
      plugins: ['transform-object-assign', 'transform-object-rest-spread']
    }),
    minify({ comments: false })
  ]
}
