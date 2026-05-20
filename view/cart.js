
const cart_products_div= document.getElementById("cart")

async function fetch_All_cart_Data(){
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

async function display_cart_products(params) {
    const cart_products= await fetch_All_cart_Data();
    
    cart_products_div.innerHTML = "";
    cart_products.forEach(element => {
        const main_product_div= document.createElement("div")
        const button_operational_div= document.createElement("div")
        const product_name= document.createElement("p")
        const product_price = document.createElement("p")
        const increase_button= document.createElement("button")
        const span = document.createElement("span")
        const decrease_button = document.createElement("button")

        product_name.innerHTML = element.product;
        product_price.innerHTML = element.price;
        increase_button.innerHTML="+"
        span.innerHTML=element.Qty
        decrease_button.innerHTML ="-"

        main_product_div.className= "product"
        button_operational_div.id= element._id

        button_operational_div.appendChild(decrease_button)
        button_operational_div.appendChild(span)
        button_operational_div.appendChild(increase_button)

        main_product_div.appendChild(product_name)
        main_product_div.appendChild(product_price)
        main_product_div.appendChild(button_operational_div)

        cart_products_div.appendChild(main_product_div)
    });

    
}
display_cart_products()

document.addEventListener("click", (e)=>{
    let clicked_button= e.target
    let parent_clicked_button_div= clicked_button.parentElement
       
    if (clicked_button.tagName !== "BUTTON") return;
    let text = clicked_button.innerHTML.trim();
    if (text !== "+" && text !== "-" && text !== "Add to cart") return;
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
        cart_Grand_Total()
    } else if(clicked_button.innerHTML==="-") {
        let span = clicked_button.nextElementSibling
        span_value =Number(span.innerHTML)
        if(span_value===1){   
           let parent_entire_product_div= parent_clicked_button_div.parentElement          
           parent_entire_product_div.remove();
           delete_product(id)
        }
        span_value--
        span.innerHTML = span_value
        update_cart_qty(id, span_value)
        cart_Grand_Total()
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

async function cart_Grand_Total() {
    const url2="/cart_GrandTotal_price"
    try {
        const cart_results = await fetch(url2, {
            method:"GET"
        })
        const Grand_Total = await cart_results.json()
        const cash_out_span = document.getElementById("cashout")
        cash_out_span.innerHTML=Grand_Total
        return Grand_Total;
    } catch (error) {
        console.log(error)
    }    
}
cart_Grand_Total();

const place_ordered_btn= document.getElementById("place_ordered_btn")
place_ordered_btn.addEventListener("click", async()=>{

    let delivery_location = document.getElementById("delivery_location")
    let order_confirmation_div=document.getElementById("order_confirmation")
    if (!delivery_location.value.trim()) {
        alert("Please enter a delivery address before placing an order!");
        return;
    }

    let cart_products= await fetch_All_cart_Data();
    let total_Amount= await cart_Grand_Total();
    let url= "/order"
    try {
        const response= await fetch(url, {
            method: 'post', // PATCH is ideal for updating just one field (quantity)
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items:cart_products,
                total_Amount:total_Amount,
                location: delivery_location.value
            })
        })
        const result = await response.json();
        await displaying_order(result)
        order_confirmation_div.style.display="flex"

        console.log(result)
    } catch (error) {
        console.log(error)
    }
})

async function displaying_order(result) {
    const order_div= document.getElementById("customers_order")   
    order_div.innerHTML = "";

    const order_id_p= document.createElement("p")
    const order_id= document.createElement("p")

    order_id_p.innerHTML="OrderID"
    order_id.innerHTML = result._id

    order_div.appendChild(order_id_p)
    order_div.appendChild(order_id)
    const h4= document.createElement("h4")
    h4.innerHTML= "Items:"
    order_div.appendChild(h4)

    result.items.forEach(element => {
        const product_name= document.createElement("p")
        const product_price= document.createElement("p")
        const product_qty = document.createElement("p")
        

        product_name.innerHTML= element.product
        product_price.innerHTML= element.price
        product_qty.innerHTML= element.Qty
        

        order_div.appendChild(product_name)
        order_div.appendChild(product_price)
        order_div.appendChild(product_qty)        
    });
    const total_Amount= document.createElement("p")
    const order_location= document.createElement("p")    

    total_Amount.innerHTML=result.total_Amount
    order_location.innerHTML = result.location
    

    order_div.appendChild(total_Amount);
    order_div.appendChild(order_location)
    

}


