import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { storage } from '../components/form/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { styles } from '../components/form/styleCart';

import VariationGeneralInfo from '../components/form/VariationGeneralInfo';
import Description from '../components/form/Description';
import Meta from '../components/form/Meta';
import VariationImages from '../components/form/VariationImages';

const colorOptions = [
  { sv: 'Röd', en: 'red' },
  { sv: 'Blå', en: 'blue' },
  { sv: 'Grön', en: 'green' },
  { sv: 'Gul', en: 'yellow' },
  { sv: 'Svart', en: 'black' },
  { sv: 'Vit', en: 'white' },
  { sv: 'Orange', en: 'orange' },
  { sv: 'Lila', en: 'purple' },
  { sv: 'Brun', en: 'brown' },
  { sv: 'Grå', en: 'gray' },
];

const AddAccessoryPage = () => {
  const [accessory, setAccessory] = useState({
   
    color: false,
    meta: false,
    type: '',
   
  });





const [product, setProduct] = useState({
    name: '',
    sku: '',
    price: {},

      buying_price: {},
      sale_price: {},
    quantity: 0,
    description: { se: '' },
    specialProductData: false,
    meta: [],
    image: { thumbnail: '', original: '' },
    brand: '',
    featured: false,
    weightPack: 0,
    widthPack: 0,
    heightPack: 0,
    lengthPack: 0,
    vat: 0.255,
    produktvariation: true,
    variationGroup: {
      se: accessory.type},
    colorAndOtherVariationData: {"color": accessory.color, "meta": accessory.meta},
    createdDate: new Date().toISOString(),
     isProductOption: false,
    name_parrent: ""
  

  });




 const [isSingleImageUploaded, setIsSingleImageUploaded] = useState(false);

  const handleSingleImageUpload = (image) => {
    setProduct((prev) => ({
      ...prev,
      image,
    }));
    setIsSingleImageUploaded(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

const handleInputChange = (e) => {
  const { name, value } = e.target;

  setAccessory((prev) => ({
    ...prev,
    [name]: value,
  }));
};

console.log(accessory)


  /* const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    try {
      const accessorySlug = accessory.namn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const storageRef = ref(storage, `tillbehor/${accessorySlug}/${accessorySlug}.webp`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, resolve);
      });
      const imageUrl = await getDownloadURL(storageRef);
      setAccessory((prevAccessory) => ({
        ...prevAccessory,
        img: { url: imageUrl },
        value: true,
      }));
      setUploadStatus('Upload successful.');
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('Failed to upload image.');
    }
  }; */

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    const accessoryToSubmit = { ...accessory };
    delete accessoryToSubmit.type;
    if (accessory.type !== 'image') {
      delete accessoryToSubmit.img;
    }
    if (accessory.type !== 'color') {
      delete accessoryToSubmit.meta;
    }
    delete accessoryToSubmit.color;

    accessoryToSubmit.uid = user.uid;
    accessoryToSubmit.email = user.email;

    setIsSubmitting(true);
    try {
      const response = await fetch('https://serverkundportal-dot-natbutiken.lm.r.appspot.com/addOptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessoryToSubmit),
      });
      if (response.ok) {
        setMessage('Accessory added successfully!');
        setAccessory({
          value: '',
          img: { url: '' },
          attribute: { name: '', slug: '' },
          price: 0,
          color: '',
          meta: '',
          type: '',
          namn: ''
        });
      } else {
        setMessage('Failed to add accessory.');
      }
    } catch (error) {
      console.error('Error adding accessory:', error);
      setMessage('Error adding accessory.');
    }
    setIsSubmitting(false);
  }; */

  const handleSubmitDetailed = async (e) => {
    e.preventDefault();

const updatedProduct = {
    ...product,
    variationGroup:{se: accessory.type},
    colorAndOtherVariationData: {
      color: accessory.color,
      meta: accessory.meta,
    },
  };


   /*  if (!user) {
      alert('User is not logged in');
      return;
    } */

 /*    product.uid = user.uid;
    product.email = user.email; */

    if (!product.name || !product.brand) {
      alert('Please fill in the name and brand before submitting.');
      return;
    }

/*     https://serverkundportal-dot-natbutiken.lm.r.appspot.com
 */    
    try {
      const response = await fetch(`https://serverkundportal-dot-natbutiken.lm.r.appspot.com/addVariation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct), // Submit product data including countries and related products
      });
      if (response.ok) {
        alert('Produkten las till utan problem!');
      } else {
        console.error('Failed to add product:', await response.text());
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div>
      <h2>Lägg till variation</h2>
      {message && <p>{message}</p>}
     
        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
              <label htmlFor="type">Välj tillbehör (Gruppnamn för kunden):</label>
              <select
                name="type"
                id="type"
                value={accessory.type}
                onChange={handleInputChange}
                required
                style={{ flexGrow: 1 }}
              >
                <option value="">Typ av variation (Namn på gruppering)</option>
                <option value="färg">Färg</option>
                <option value="storlek">Storlek</option>
                <option value="variationer">Variation</option>
                 <option value="version">Version</option>
                <option value="detaljer">Eget gruppnamn</option>
              </select>
            </div>

           
            
            
          </div>
          {accessory.type === 'color' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
                <label htmlFor="color">Färgval:</label>
                <select
                  name="color"
                  id="color"
                  value={accessory.color}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Välj färg</option>
                  {colorOptions.map((color) => (
                    <option key={color.en} value={color.en}>
                      {color.sv}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
                <label htmlFor="meta">Meta (som syn för kund):</label>
                <input
                  type="color"
                  name="meta"
                  id="meta"
                  value={accessory.meta}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}
       
          
        </div>
       
        {accessory.type === 'details' && (
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <label htmlFor="attributeName">Gruppnamn:</label>
                <input
                  type="text"
                  name="attributeName"
                  id="attributeName"
                  value={accessory.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}
   
      <form onSubmit={handleSubmitDetailed} className='form'>
     
          <VariationGeneralInfo product={product} setProduct={setProduct} accessory={accessory} />
          <Description product={product} setProduct={setProduct} />
          <VariationImages
            product={product}
            setProduct={setProduct}
            onSingleImageUpload={handleSingleImageUpload}
            
          />
        
          <Meta product={product} setProduct={setProduct} />
        
          <button type="submit">Lägg till Variation Detalj</button>
        </form>
    </div>
  );
};

export default AddAccessoryPage;
