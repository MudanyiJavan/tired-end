const itemName = document.getElementById("itemName")
const itemPrice = document.getElementById("itemPrice")
const btn = document.getElementById("btn")
const productsDIV= document.getElementById("products")
const para = document.getElementById("para")

//fetching all product data
async function fetchAllproducts() {
    const url = "/products"
    try {
        const fetchedData = await fetch(url,{
            method: "Get"
        })
        const Productdata = await fetchedData.json()
        return Productdata;
    } catch (error) {
        console.log(error)
    }
}
//fetch cart data
async function fetchcartData(){
    const url2="/cart"
    try {
        const cartresults = await fetch(url2, {
            method:"GET"
        })
        const cartresponse = await cartresults.json()
        return cartresponse;
    } catch (error) {
        console.log(error)
    }
}

//loading database ecosystem
async function fetching_allproducts(){ 
    try {       
        // all product database
       const itemsData = await fetchAllproducts();
        //cart data
        const cartResults = await fetchcartData()
        itemsData.forEach(element=>{
            const dataId = element._id
            //elements creation
            const div = document.createElement("div")
            const actionContainer = document.createElement("div")
            const p1 = document.createElement("p")
            const p2 = document.createElement("p")       
                       
            let itemQty;        
                
            cartResults.forEach(data=>{                
                if(dataId===data.itemId){
                    cartStatus = true
                    itemQty = data.Qty              
                }
            })
            if(cartStatus){  
                actionContainer.setAttribute("id", `${dataId}`)             
                actionContainer.innerHTML =`<button data-incdec ="dec" class= "incdec"> - </button> <span class="qty-display" > ${itemQty} </span> <button data-incdec="inc" class="incdec" >+</button>`
            }else{               
                const btn = document.createElement("button")
                btn.setAttribute("class", "productClass")               
                btn.setAttribute("data-id1",`${dataId}`)
                actionContainer.setAttribute("id", `${dataId}`)
                btn.textContent = "Add to Cart"
                actionContainer.appendChild(btn)
            }
            p1.textContent = element.product
            p2.textContent = element.price
            
            
            div.setAttribute("class", "product")
            div.setAttribute("data-id", `${dataId}`)          

            div.appendChild(p1)
            div.appendChild(p2)
            div.appendChild(actionContainer)
            

            productsDIV.appendChild(div)

        })
    } catch (error) {
               const p = document.createElement("p")
        p.textContent= error.message

        productsDIV.appendChild(p)
    }
}
//fetching_allproducts();

//uploading items
btn.addEventListener("click", async()=>{
    const dataItem= {product:itemName.value, price:itemPrice.value}
    const url = '/';
    try {
        const response = await fetch(url,{
            method: "POST",
            headers: {
                "Content-Type": "application/json" // <--- THIS IS WHAT'S MISSING
            },
            body:JSON.stringify(dataItem)
        })
        const results = await response.json()
        results.forEach(element=>{
            const dataId = element._id
            const div = document.createElement("div")
            const divbutton = document.createElement("div")
            const p1 = document.createElement("p")
            const p2 = document.createElement("p")
            const button = document.createElement("button")

            p1.textContent = element.product
            p2.textContent = element.price
            button.textContent = "Add to Cart"

            div.setAttribute("class", "product")
            div.setAttribute("data-id", `${dataId}`)
            button.setAttribute("class", "productClass")
            button.setAttribute("data-id1",`${dataId}`)
            divbutton.setAttribute("id", String(dataId));

            divbutton.appendChild(button)
            div.appendChild(p1)
            div.appendChild(p2)
            div.appendChild(divbutton)

            productsDIV.appendChild(div)
        })

        itemName.value=""
        itemPrice.value=""
       
    } catch (error) {
        const p = document.createElement("p")
        p.textContent= error.message
        productsDIV.appendChild(p)
        //parse the error to frontend page
    }
})

//  adding it to cart
const cartDiv = document.getElementById("cart-products")

document.addEventListener("click", async(e)=>{    
    const addtoCartButton = document.querySelectorAll(".product") 
    const clickedbtn= e.target   
    const btn = e.target
    const incDecBtn = clickedbtn.closest(".incdec");

    if (!btn && !incDecBtn) return;       
   
    let productId;
    if (btn) {
        productId = btn.getAttribute("data-id1");
    } else if (incDecBtn) {
        // This assumes the wrapper div has the data-id1 or 
        // you added the ID to the incdec buttons themselves.
        const wrapper = incDecBtn.parentElement; 
        productId = wrapper.id; // Using the ID you set on buttondiv
    }

    let itemQty;
    let idobject;
    const dbid = String(productId)
    const buttondiv = document.getElementById(dbid)
    para.textContent= productId
   
    if (incDecBtn) {
        const span = buttondiv.querySelector(".qty-display");
        let currentQty = parseInt(span.textContent);
        const action = incDecBtn.getAttribute("data-incdec");

        if (action === "inc") {
            currentQty++;
        } else if (action === "dec") {
            currentQty--;
        }
        // 4. Update UI or Reset to "Add to Cart"
        if (currentQty > 1) {
            span.textContent = currentQty;
        } else {
            // If it hits 0, bring back the original button
            buttondiv.innerHTML = `<button class="productClass" data-id1="${productId}">Add to Cart</button>`;
        }      
    }

    if(clickedbtn.textContent==="Add to Cart"){
        e.preventDefault() 
        itemQty = 1;
        idobject= {itemID: productId, quantity:itemQty}
        buttondiv.innerHTML=  `<button data-incdec="dec" class="incdec"> - </button> <span class="qty-display"> ${itemQty} </span> <button data-incdec="inc" class ="incdec"> +</button> `
                
    }else{
        itemQty= 0
        idobject= {itemID: productId, quantity:itemQty}
    }  

    //from here, cart diplay operation begins 
    cartinsertion(idobject)   
     
})
async function cartinsertion(idobject) {
    const url = "/cart"
    try {
        const res = await fetch(url, {
            method: "POST", 
            headers: {
                "Content-Type":"application/json"
            }, 
            body:JSON.stringify(idobject)
        })
        const results = await res.json()
        results.forEach(element=>{
            const div = document.createElement("div")
            const p1 = document.createElement("p")
            const p2 = document.createElement("p")
            const button = document.createElement("button")

            let qty = element.Qty                 
                    
            p1.textContent = element.product
            p2.textContent = element.price
            button.innerHTML = `<button> - </button> <span> ${qty} </span> <button> +</button> `

            div.setAttribute("class", "product")            

            div.appendChild(p1)
            div.appendChild(p2)
            div.appendChild(button)

            cartDiv.appendChild(div)            
        })
    } catch (error) {
                   const p = document.createElement("p")
        p.textContent= error.message

        productsDIV.appendChild(p)
    }   
}

async function decrement(clickedElement, id){
    const container = clickedElement.parentElement;
    let span = container.querySelector("span");
    let currentQty = parseInt(span.textContent);

    if(currentQty<=1){
        container.innerHTML = `<button class="productClass" data-id1="${id}">Add to Cart</button>`;
    }else{
        
    }
}

// display cart data
async function cartData(){
    const url = "/cart"
    try {
        const res = await fetch(url, {
            method:"GET"
        })
        const results = await res.json()
        results.forEach(element=>{
            let quantity = element.Qty
            const div = document.createElement("div")
            const p1 = document.createElement("p")
            const p2 = document.createElement("p")
            const button = document.createElement("button")

            p1.textContent = element.product
            p2.textContent = element.price
            button.innerHTML =`<button> - </button> <span> ${quantity} </span> <button> +</button> `

            div.setAttribute("class", "product")            

            div.appendChild(p1)
            div.appendChild(p2)
            div.appendChild(button)

            cartDiv.appendChild(div)
        })
    } catch (error) {
               const p = document.createElement("p")
        p.textContent= error.message

        productsDIV.appendChild(p)
    }
}
cartData()

//add-to-cart functionality
document.addEventListener("click",(e)=>{

})
//objectives
//separating the functions into :
    // i)one works only if the product has "add to cart"
    //ii) works when there are incredecremetn button buttons
    //iii)inside cart insertation function check if the product exist, if yes just get the qty value from the incdec function
//inside adding product =>after adding don't display but call the function which was load all products on the screen    
