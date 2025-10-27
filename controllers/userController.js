
//User's Route Handler
exports.getAllUsers = (req,res)=>{
    console.log(req.requestTime);
    res.status(500).json({
        status : "success",
        message : "Internal Server Failer"
    });
}

exports.createAUser = (req,res)=>{
    // setting up newtour
     const newId =tours[tours.length - 1].id + 1;
     const newTour = Object.assign({id :newId},req.body);

     res.status(500).json({
        status : "success",
        message : "Internal Server Failer"
    });
}

exports.getAUser = (req,res)=> {
    // Formatting params
        const id = req.params.id * 1;
    
    //Wrong id
    if(id>tours.length){
        return res.status(404).json({
            status:"fail",                        
            message : "Invalid ID"
        })
    }
    res.status(500).json({
        status : "success",
        message : "Internal Server Failer"
    });

}

exports.updateAUser = (req,res)=> {
    // Formatting params
        const id = req.params.id * 1;
    
    //Wrong id
    if(id>tours.length){
        return res.status(404).json({
            status:"fail",                        
            message : "Invalid ID"
        })
    }
    res.status(500).json({
        status : "success",
        message : "Internal Server Failer"
    });

}

exports.deleteAUser = (req,res)=> {
    // Formatting params
        const id = req.params.id * 1;
    
    //Wrong id
    if(id>tours.length){
        return res.status(404).json({
            status:"fail",                        
            message : "Invalid ID"
        })
    }
    res.status(204).json({
        status : "success",
        data:null
    });

}