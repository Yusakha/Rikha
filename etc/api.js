const { fetchJson, fetchBase64 } = require('./fetcher.js')

/**
 * create custom meme
 * @param  {String} imageUrl
 * @param  {String} topText
 * @param  {String} bottomText
 */
const custom = async (imageUrl, top, bottom) => new Promise((resolve, reject) => {
    topText = top.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    bottomText = bottom.trim().replace(/\s/g, '_').replace(/\?/g, '~q').replace(/\%/g, '~p').replace(/\#/g, '~h').replace(/\//g, '~s')
    fetchBase64(`https://api.memegen.link/images/custom/${topText}/${bottomText}.png?background=${imageUrl}`, 'image/png')
        .then((result) => resolve(result))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

const sreddit = async (reddit) => new Promise((resolve, reject) => {
    fetchJson('https://meme-api.herokuapp.com/gimme/' + reddit + '/')
      .then((rest) => {
          resolve(rest)
   })
      .catch((errr) => {
          reject(errr)
      })
})

module.exports = {
    custom,
    sreddit
}