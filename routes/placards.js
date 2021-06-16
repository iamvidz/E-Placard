const express=require('express')
const router =express.Router()
const { ensureAuth } = require('../middleware/auth')

const Placard= require('../models/Placard')

// @desc show add page
// @route GET /placards/add

router.get('/add',ensureAuth, (req,res) => {
    res.render('placards/add')
})

// @desc Process add form
// @route POST /placards

router.post('/',ensureAuth, async (req,res) => {
    try {
        req.body.user = req.user.id
        await Placard.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc show all placards
// @route GET /placards

router.get('/',ensureAuth, async (req,res) => {
    try {
        const placards= await Placard.find({ status: 'public'})
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()

        res.render('placards/index',{
            placards,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc show single placard
// @route GET /placards/:id

router.get('/:id',ensureAuth, async (req,res) => {
    try {
        let placard = await Placard.findById(req.params.id)
        .populate('user')
        .lean()

        if(!placard){
            return res.render('error/404')
        }

        res.render('placards/show',{
            placard
        })
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})

// @desc show edit page
// @route GET /placards/edit/:id

router.get('/edit/:id',ensureAuth, async (req,res) => {
    try {
        const placard= await Placard.findOne({
            _id: req.params.id
        }).lean()
    
        if(!placard) {
            return res.render('error/404')
        }
    
        if(placard.user != req.user.id){
            res.redirect('/placards')
        }else {
            res.render('placards/edit',{
                placard,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
    
})

// @desc update placard
// @route PUT /placards/:id

router.put('/:id',ensureAuth, async (req,res) => {
    try {
        let placard= await Placard.findById(req.params.id).lean()

        if(!placard){
            return res.render('error/404')
        }

        if(placard.user != req.user.id){
            res.redirect('/placards')
        }else {
            placard= await Placard.findOneAndUpdate({_id: req.params.id}, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
    
})

// @desc Delete placard
// @route DELETE /placards/:id

router.delete('/:id',ensureAuth, async (req,res) => {
    try {
        await Placard.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// @desc User placards
// @route GET /placards/user/:userId

router.get('/user/:userId',ensureAuth, async (req,res) => {
    try {
        const placards = await Placard.find({
            user: req.params.userId,
            status: 'public'
        })
        .populate('user')
        .lean()

        res.render('placards/index',{
            placards
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')      
    }
})

module.exports=router
