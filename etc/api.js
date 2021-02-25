const { fetchJson, fetchBase64 } = require('./fetcher.js')
const axios = require('axios')
// const fetch = require('node-fetch')

// api
// Aruga : https://arugaz.herokuapp.com/

// https://mhankbarbar.herokuapp.com/api
// https://scrap.terhambar.com/


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

const sreddit = async (argument) => new Promise((resolve, reject) => {
    if (typeof argument == "object") {reddit = argument[Math.random() * argument.length | 0]}
    else reddit = argument
    console.log(`looking for ${argument} picture on reddit` )
    fetchJson('https://meme-api.herokuapp.com/gimme/' + reddit + '/')
      .then((rest) => {
          resolve(rest)
   })
      .catch((errr) => {
          reject(errr)
      })
})

const pinterest = async (argument) => new Promise((resolve, reject) => {
    if (typeof argument == "object") {arguments = argument[Math.random() * argument.length | 0]}
    else arguments = argument
    console.log(`looking for ${arguments} picture on pinterest` )
    var urlshot = "https://api.fdci.se/rep.php?gambar=" + arguments
    axios.get(urlshot).then((result) => {
    var pictures = JSON.parse(JSON.stringify(result.data))
    var pict =  pictures[Math.floor(Math.random() * pictures.length)]
    resolve(pict)
    })
    .catch(
        (error) => {
            console.log(error)
            reject(error)
      })
})

const mhankbarbar = async (argument) => new Promise((resolve, reject) => {
    console.log(`looking for ${argument} picture on mhankbarbar` )
    fetchJson('https://mhankbarbar.herokuapp.com/api/' + argument)
      .then((rest) => {
          resolve(rest)
   })
      .catch((errr) => {
          reject(errr)
      })
})

const computerfreaker = async (argument) => new Promise((resolve, reject) => {
    console.log(`looking for ${argument} picture on https://api.computerfreaker.cf/` )
    const url = 'https://api.computerfreaker.cf/v1/' + argument
    axios.get(url,{method: 'get',headers: {'user-agent': 'chi-whatsapp-bot'}})
      .then((result) => {
            resolve(result.data.url)
  })
      .catch(
        (error) => {
            console.log(error)
            reject(error)
      })
})

module.exports = {
    custom,
    sreddit,
    pinterest,
    mhankbarbar,
    computerfreaker
}