const all_Products_Div = document.getElementById("allproducts")

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

async function Display_All_products(params) {
    const All_products= await fetchAllproducts();
    const cart_object_array = await cart();
    console.log(cart_object_array)

    for(const element of All_products) {     
        const matched_cart_product = cart_object_array.find(item => item.object_id === element._id);

        const main_product_div= document.createElement("div")
        const button_operational_div= document.createElement("div")
        const product_name= document.createElement("p")
        const product_price = document.createElement("p")

        main_product_div.className= "product"
        if(matched_cart_product) {              
            const increase_button= document.createElement("button")
            const span = document.createElement("span")
            const decrease_button = document.createElement("button")

            button_operational_div.id= element._id
            product_name.innerHTML= element.product
            product_price.innerHTML= element.price 
            increase_button.innerHTML= "+"
            span.innerHTML= matched_cart_product.object_qty
            decrease_button.innerHTML="-"

            button_operational_div.appendChild(decrease_button)
            button_operational_div.appendChild(span)
            button_operational_div.appendChild(increase_button)

            main_product_div.appendChild(product_name)
            main_product_div.appendChild(product_price)
            main_product_div.appendChild(button_operational_div)

            all_Products_Div.appendChild(main_product_div)
        } else {
            const add_to_cart_button= document.createElement("button")

            add_to_cart_button.innerHTML="Add to Cart"
            product_name.innerHTML= element.product
            product_price.innerHTML= element.price 
            button_operational_div.id= element._id

            button_operational_div.appendChild(add_to_cart_button)
            main_product_div.appendChild(product_name)
            main_product_div.appendChild(product_price)
            main_product_div.appendChild(button_operational_div)

            all_Products_Div.appendChild(main_product_div)
            
            
        };
    }
}    
Display_All_products()

async function cart() {
    const Cart_products = await fetchcartData();
    let cart_product_array = []; // Start with an empty object

    // Loop through and assign keys dynamically
    Cart_products.forEach(element => {
        const product_id = element._id;
        const product_quantity = element.Qty;

        // Add the ID as a key inside the object
        let cart_product_object = {
            object_id:product_id,
            object_qty: product_quantity
        };
        cart_product_array.push(cart_product_object)
    });
    return cart_product_array;              
     
}

document.addEventListener("click", (e)=>{
    let clicked_button= e.target
    let parent_clicked_button_div= clicked_button.parentElement
       
    if (clicked_button.tagName !== "BUTTON") return;
    e.preventDefault();
    let span_value;
    let id= parent_clicked_button_div.getAttribute("id")
    console.log(id)

    if (clicked_button.innerHTML==="+") {
        let span = clicked_button.previousElementSibling
       span_value = Number(span.textContent)
        span_value ++;
        span.innerHTML= span_value;
        update_cart_qty(id, span_value);
        number_cart_documents();
    } else if(clicked_button.innerHTML==="-") {
        let span = clicked_button.nextElementSibling
        span_value =Number(span.innerHTML)
        if(span_value===1){            
           parent_clicked_button_div.innerHTML=`<button> Add to Cart</button>`
           delete_product(id)
        }
        span_value--
        span.innerHTML = span_value
        update_cart_qty(id, span_value)
        number_cart_documents()
    } else{
        parent_clicked_button_div.innerHTML= "";
        const increase_button= document.createElement("button")
        const span = document.createElement("span")
        const decrease_button = document.createElement("button")

        increase_button.innerHTML="+"
        span.innerHTML=1
        decrease_button.innerHTML="-"

        parent_clicked_button_div.appendChild(decrease_button)
        parent_clicked_button_div.appendChild(span)
        parent_clicked_button_div.appendChild(increase_button)
        posting_new_product_cart(id, 1)
        number_cart_documents();
    }

})

async function update_cart_qty(product_id, product_qty) {
    let url= "/cart"
    try {
        fetch(url, {
            method: 'PATCH', // PATCH is ideal for updating just one field (quantity)
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                product_id:product_id,
                qty:product_qty
            })
        })
    } catch (error) {
        
    }
}

async function posting_new_product_cart(item_id, quantity) {
    let url= "/cart"
    try {
        fetch(url, {
            method: 'post', // PATCH is ideal for updating just one field (quantity)
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                itemID:item_id,
                quantity:quantity
            })
        })
    } catch (error) {
        
    }
}

async function delete_product(params) {
    let url= "/cart"
    try {
        fetch(url, {
             method: 'delete', // PATCH is ideal for updating just one field (quantity)
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                product_id:params                
            })
        })
    } catch (error) {
        
    }
}

async function number_cart_documents() {
        const url2="/cart_documents"
    try {
        const cart_results = await fetch(url2, {
            method:"GET"
        })
        const cart_response = await cart_results.json()
        const span = document.getElementById("count_documents")
        span.innerHTML=cart_response
    } catch (error) {
        console.log(error)
    }
}
number_cart_documents()