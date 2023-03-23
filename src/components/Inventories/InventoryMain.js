import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Message from '../LoadingError/Error';
import debounce from "lodash.debounce";
import InventoryTable from "./InventoryTable";
import { listInventory } from './../../Redux/Actions/InventoryAction';
import Toast from '../LoadingError/Toast';
import renderToast from "../../util/Toast";
const MainInventory = () => {
  const dispatch = useDispatch()

  const [ isStop , setIsStop ] = useState(false)
  const [dessert, setDessert] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const [keyword, setSearch] = useState()
  const [toggleSearch, setToggleSearch] = useState(false)
  const [data, setData] = useState({
    from: '',
    to: ''
  })
  const {from,to} = data
  
  const inventoryList = useSelector(state=> state.inventoryList)
  const { loading, error, inventories } = inventoryList

  const callApiKeywordSearch = (keyword, from, to) =>{
      dispatch(listInventory(keyword, from, to))
  }
  const debounceDropDown = useRef(debounce((keyword, from, to) => callApiKeywordSearch(keyword, from, to) , 300)).current;

  const handleSubmitSearch = e =>{
    e.preventDefault()
    setSearch(e.target.value)
    debounceDropDown(e.target.value, data.from, data.to);
  }

  const handleChange = e =>{
    e.preventDefault();
    setData(prev => {
      return {
        ...prev, [e.target.name]: e.target.value
      }
    })
  }
  const handleSearchDate = (e) =>{
    e.preventDefault();
    if(!toggleSearch){
      if(!data.from || !data.to){
        if(!isStop){
          renderToast('Chưa chọn ngày','error', setIsStop, isStop)
        }
        return;
      }
      dispatch(listInventory(keyword, data.from, data.to)) 
    }
    else{
      setData({
        from: '',
        to: ''
      })
      dispatch(listInventory(keyword)) 
    }
    setToggleSearch(!toggleSearch)
  }

  useEffect(()=>{
      dispatch(listInventory(keyword)) 
     // eslint-disable-next-line
  },[dispatch])

  return (
    <>
    <Toast/>
    { error ? (<Message variant="alert-danger">{error}</Message>) : ''}
    <section className="content-main">
      <div className="content-header">
        <h2 className="content-title">Danh sách sản phẩm trong kho</h2>
      </div>

      <div className="card card-custom mb-4 shadow-sm">
        <header className="card-header bg-aliceblue">
          <div className="row gx-3 py-3">
            <div className="col-lg-4 col-md-6 me-auto d-flex">
              <div className="me-1" style={{flexGrow: '1'}}>
                <input
                  type="search"
                  placeholder="Tìm kiếm tên thuốc..."
                  className="form-control p-2"
                  value={keyword}
                  onChange={handleSubmitSearch}
                />
              </div>
              <div>
                <button className="btn btn-success me-1" onClick={(e)=>{
                  e.preventDefault()
                  setDessert(prev => !prev)
                }}>{!dessert ? 'Đổ màu' : 'Tắt màu'}</button>
              </div>
              <div>
                <button className="btn btn-success" onClick={(e)=>{
                  e.preventDefault()
                  setExpanded(prev => !prev)
                }}>{!expanded ? 'Mở rộng' : 'Thu gọn' }</button>
              </div>
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <div className="d-flex">
                <span className="label-date">Từ: </span>
                <input
                    id="datePicker"
                    name="from"
                    value={from}
                    className="form-control"
                    type='date'
                    onChange={handleChange}
                ></input>
              </div>
            </div>
            <div className="col-lg-2 col-6 col-md-3">
              <div className="d-flex">
                <span className="label-date">Đến: </span>
                <input
                    id="datePicker"
                    name="to"
                    value={to}
                    className="form-control"
                    type='date'
                    onChange={handleChange}
                ></input>
              </div>
            </div>
            <div className="col-lg-1">
              {toggleSearch ? 
                <button className="btn btn-danger" onClick={handleSearchDate}>Cancel</button>
              : 
                <button className="btn btn-success" onClick={handleSearchDate}>Search</button>
              }
            </div>
          </div>
        </header>

        <div>
          {inventories ?
            <InventoryTable
              inventory={inventories}
              loading={loading}
              dessert={dessert}
              expanded={expanded}
            /> : 
            <div>There are no record</div>
          }
        </div>
      </div>
    </section>
    </>
  );
};

export default MainInventory;
