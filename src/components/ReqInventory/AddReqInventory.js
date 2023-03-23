import React, { useEffect, useState } from "react";
import { createReqInventory, listReqInventory } from '../../Redux/Actions/RequestInventoryAction';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { REQ_INVENTORY_CREATE_RESET } from '../../Redux/Constants/RequestInventoryConstant';
import { listProvider } from '../../Redux/Actions/ProviderAction';
import { listUser } from "../../Redux/Actions/UserActions";
import { listProduct } from '../../Redux/Actions/ProductActions';
import { useHistory } from 'react-router-dom';
import Toast from '../LoadingError/Toast';
import  moment  from 'moment';
import renderToast from "../../util/Toast";
import DataTable from "react-data-table-component";
import NoRecords from "../../util/noData";  

const ToastObjects = {
    pauseOnFocusLoss: false,
    draggable: false,
    pauseOnHover: false,
    autoClose: 2000,
  };
const AddReqInventory = () => {  
    const dispatch = useDispatch();
    const history = useHistory();
    const createReqStatus = useSelector((state)=> state.reqInventoryCreate)
    const { success } = createReqStatus

    const providerList = useSelector((state)=>state.providerList)
    const { providers } = providerList

    const productList = useSelector((state)=>state.productList)
    const { products } = productList

    const userList  = useSelector((state)=> state.userList)
    const { users } = userList

    const [ isStop , setIsStop ] = useState(false)
    const [itemProducts, setItemProducts] = useState([]);
    const [field, setFieldProduct] = useState({
        name: '',
        unit: '',
        product: '',
        qty: 0,
    });

    const [data, setData] = useState({
        requestedAt: moment(new Date(Date.now())).format('YYYY-MM-DD'),
        note: ''
    })
      
    var { 
        provider, 
        importItems = itemProducts ? [...itemProducts] : [], 
        user,  
        requestedAt,
        note
    } = data
    // eslint-disable-next-line
    const { product, qty } = field

    const handleFocus = (event) => {
        // Xóa các ký tự 0 ở đầu nếu có
        if (event.target.value.startsWith('0')) {
          event.target.value = event.target.value.replace(/^0+/, '');
        }
      };
    

    const handleChange = e =>{
        e.preventDefault();
        setData(prev => {
          return {
            ...prev, [e.target.name]: e.target.value,
          }
        })
    }
    
    const handleChangeProduct = e =>{
        e.preventDefault();
        setFieldProduct(prev => {
            let a = document.getElementById("select-product");
            let b = a.options[a.selectedIndex]
            let c = b.getAttribute('data-foo')
            let d = b.getAttribute('data-unit')
            return {
                ...prev,
                [e.target.name]: e.target.value,
                name:c, 
                unit:d
              }
        })
    }
    const handleAddProduct = e =>{
        e.preventDefault();
        let flag = false;
        
        if(!field.product){
            if(!isStop){
                renderToast('Sản phẩm chưa được chọn','error', setIsStop, isStop)
            }
            return;
        }
        else if(field.qty <= 0){
            if(!isStop){
                renderToast('Số lượng nhập phải lớn hơn 0','error', setIsStop, isStop)
            }
            return;
        }
        else{
            importItems.forEach((item, index)=>{
                if(item.product === field.product){
                    flag = true
                    importItems.splice(index, 1, {...item, 
                        qty: parseInt(field.qty)})
                    setItemProducts(importItems)
                 }
            })
            if(!flag){
                setItemProducts(prev => 
                    [...prev, {...field, qty: parseInt(qty)}]
                )
            }
        }
    }
    const handleSubmit = e => {
        e.preventDefault();
        dispatch(createReqInventory({
           ...data,
           requestItems: importItems,
        }));
    }
    const handleDeleteItem = (e, index) =>{
        e.preventDefault()
        importItems.splice(index, 1)
        setItemProducts(importItems)
    }
    useEffect(()=>{
        if(success){
            toast.success(`Yêu cầu đặt hàng thành công`, ToastObjects);
            dispatch({type: REQ_INVENTORY_CREATE_RESET})
            setData({
                requestedAt: moment(new Date(Date.now())).format('YYYY-MM-DD'),
                note: ''
            })
            setFieldProduct({
                name: '',
                product: '',
                unit: '',
                qty: 0,
            })
            setItemProducts([])
            dispatch(listReqInventory())
        }
        dispatch(listProvider())
        dispatch(listProduct())
        dispatch(listUser())
    }, [success, dispatch])


    const customStyles = {
        rows: {
            highlightOnHoverStyle: {
            backgroundColor: 'rgb(230, 244, 244)',
            borderBottomColor: '#FFFFFF',
            // borderRadius: '25px',
            outline: '1px solid #FFFFFF',
            },
        },
        header: {
            style: {
                minHeight: '56px',
            },
        },
        headRow: {
            style: {
                fontSize: '16px',
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor:'grey',
            },
        },
        headCells: {
            style: {
            '&:not(:last-of-type)': {
                borderRightStyle: 'solid',
                borderRightWidth: '1px',
                borderRightColor: 'grey',
            },
            },
        },
        cells: {
            style: {
                fontSize: '16px',
            '&:not(:last-of-type)': {
                borderRightStyle: 'solid',
                borderRightWidth: '1px',
                borderRightColor: 'grey',
            },
            },
        },
    };

    const columns = [
        {
            name: "STT",
            selector: (row, index) => <b>{index+1}</b>,
            reorder: true,
            width: '60px'

        },
        {
            name: "Tên thuốc",
            selector: (row) => row?.name,
            sortable: true,
            reorder: true,
            grow: 3,
        },
        {
            name: "Đơn vị",
            selector: (row) => row?.unit,
            sortable: true,
            reorder: true,
            grow: 2,
        },
        {
            name: "Số lượng",
            selector: (row) => row?.qty,
            sortable: true,
            reorder: true,
            grow: 2,
        },
        {  
            name: "Hành động",
            selector: (row, index) => {
              return (
                <div>
                  <button
                    style={{fontSize: '18px'}}
                    className="dropdown-item text-danger"
                    onClick={(e) => handleDeleteItem(e, index, row?.product?._id || row?.product)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              )
            },
            sortable: true,
            reorder: true,
            grow: 2,
        },
    ];

    const handleRowClicked = (row) => {
        setFieldProduct({
            name: row?.name,
            product: row?.product,
            unit: row?.unit,
            qty: row?.qty,
        })
    };
    return (
      <>
        <Toast/>
        <section className="content-main" style={{display: 'grid'}} >
            <form onSubmit={handleSubmit}>

                <div className="content-header">
                    <div className="content-title d-flex" onClick={e=>{
                        e.preventDefault()
                        history.push("/req-inventory")
                    }}>
                        <h4 className="arrow-breadcrum"><i className="fas fa-arrow-left"></i></h4>
                        <h3>Tạo yêu cầu đặt hàng</h3>
                    </div>
                    <div>
                    <button type="submit" className="btn btn-primary">
                        Tạo đơn
                    </button>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="card card-custom mb-4 shadow-sm">
                        <div className="card-body">
                            <div className="mb-4 form-divided-2">
                                <div>
                                    <label htmlFor="name_drug" className="form-label">
                                        Nhà cung cấp
                                    </label>
                                    <select
                                    id="select-provider"
                                    value={provider}
                                    name="provider"
                                    onChange={handleChange}
                                    className="form-control"
                                    required >
                                        <option value=''>Chọn nhà cung cấp</option>
                                        {providers?.map((item, index)=>(
                                        <option key={index} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Ghi chú</label>
                                    <input
                                        name="note"
                                        className="form-control"
                                        type='text'
                                        onChange={handleChange}
                                        value={note}
                                    ></input>
                                </div>
                            </div>
                            <div className="mb-4 form-divided-2">
                                <div>
                                    <label className="form-label">Ngày nhập</label>
                                    <input
                                        id="datePicker"
                                        name="requestedAt"
                                        className="form-control"
                                        type='date'
                                        required
                                        onChange={handleChange}
                                        value={requestedAt}
                                    ></input>
                                </div>
                                <div>
                                    <label htmlFor="product_category" className="form-label">
                                        Người nhập
                                    </label>
                                    <select
                                    value={user}
                                    name="user"
                                    onChange={handleChange}
                                    className="form-control"
                                    required >
                                        <option value=''>Chọn người nhập</option>
                                        {users?.map((item, index)=>(
                                            <option key={index} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="card card-custom mb-4 shadow-sm">
                        <div className="card-body">
                            <div className="mb-4 form-divided-2">
                                <div>
                                    <label htmlFor="product_category" className="form-label">
                                        Tên thuốc
                                    </label>
                                    <select
                                    id="select-product"
                                    value={product}
                                    name="product"
                                    onChange={handleChangeProduct}
                                    className="form-control"
                                    required >
                                        <option value=''>Chọn thuốc</option>
                                        {products?.map((item, index)=>(
                                            <option key={index} value={item._id} data-foo={item.name} data-unit={item.unit}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="qty" className="form-label">
                                        Số lượng
                                    </label>
                                    <input
                                        name="qty"
                                        value={qty}
                                        type="number"
                                        className="form-control"
                                        required
                                        onChange={handleChangeProduct}
                                        onFocus={handleFocus}
                                    />
                                </div>
                            </div>
                            <div className="mb-6 d-flex justify-content-end">
                                <button className="btn btn-success" onClick={handleAddProduct}>Thêm sản phẩm</button>
                            </div>   
                        </div>
                    </div>
                </div> 
                <div className="card card-custom mb-4 shadow-sm">
                    <DataTable
                        // theme="solarized"
                        columns={columns}
                        data={itemProducts}
                        noDataComponent={NoRecords()}
                        customStyles={customStyles}
                        onRowClicked={handleRowClicked}
                        defaultSortFieldId
                        highlightOnHover
                        pointerOnHover
                    />    
                 </div>
            </form>
        </section>
      </>
    );
  }

  export default AddReqInventory;