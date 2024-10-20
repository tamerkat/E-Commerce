// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react'
import './Addproduct.css'
import upload_area from '../../assets/upload_area.svg'

const Addproduct = () => {

    const [image, setImage] = useState(false)

    const [productDetails, setProductDetails] = useState({
        name: '',
        image: '',
        category: 'women',
        new_price: '',
        old_price: '',
    })

    const imageHandelar = (e) => {
        setImage(e.target.files[0]);
    }

    const changeHandelar = (e) => {
        setProductDetails({...productDetails, [e.target.name]:e.target.value})
    }

    const Add_product = async () => {
        console.log(productDetails)
        let responeData;
        let product = productDetails;

        let formData = new FormData()
        formData.append('product', image);

        await fetch('http://localhost:4000/upload', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: formData,
        }).then((resp) => resp.json()).then((data) => {responeData = data})

        if (responeData.success){
            product.image = responeData.image_url;
            console.log(product);
        }
    }

  return (
    <div className='addproduct'>
      <div className="addproduct-item">
        <p>Product title</p>
        <input value={productDetails.name} onChange={changeHandelar} type="text" name='name' placeholder='Type here' />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-item">
            <p>Price</p>
            <input value={productDetails.old_price} onChange={changeHandelar} type="text" name='old_price' placeholder='Type here' />
        </div>
        <div className="addproduct-item">
            <p>Offer Price</p>
            <input value={productDetails.new_price} onChange={changeHandelar} type="text" name='new_price' placeholder='Type here' />
        </div>
      </div>
      <div className="addproduct-item">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandelar} className='addproduct-select' name="category">
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kid">Kids</option>
        </select>
      </div>
      <div className="addproduct-item">
        <label htmlFor="file-input">
            <img src={image ? URL.createObjectURL(image) : upload_area} className='addproduct-img' alt="" />
        </label>
        <input onChange={imageHandelar} type="file" name="image" id="file-input" hidden />
      </div>
      <button onClick={()=>{Add_product()}} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default Addproduct
