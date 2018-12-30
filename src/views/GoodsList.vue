<template>
<div>
<nav-header></nav-header>
<nav-bread>
  <span>Goods</span>
</nav-bread>
<div class="accessory-result-page accessory-page">
  <div class="container">
    <div class="filter-nav">
      <span class="sortby">Sort by:</span>
      <a href="javascript:void(0)" class="default cur">Default</a>
      <a href="javascript:void(0)" class="price" @click="sortGoods">Price
        <img src="./../assets/icon-arrow-short.svg" class="icon icon-arrow-short" :class="{'sort-up':!sortFlag}"></img>
      </a>
      <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
    </div>
    <div class="accessory-result">
      <!-- filter -->
      <div class="filter stopPop" id="filter" :class="{'filterby-show':filterby}">
        <dl class="filter-price">
          <dt>Price:</dt>
          <dd><a href="javascript:void(0)" :class="{'cur':priceChecked =='all'}" @click="setAllFilter">All</a></dd>
          <dd v-for="(item,index) in priceFilter">
            <a href="javascript:void(0)" :class="{'cur':priceChecked ==index}" @click="setPriceFilter(index)">{{item.startPrice}} - {{item.endPrice}}</a>
          </dd>
        </dl>
      </div>

      <!-- search result accessories list -->
      <div class="accessory-list-wrap">
        <div class="accessory-list col-4">
          <ul>
            <li v-for="(item,index) in goodsList">
              <div class="pic">
                <a href="#"><img :key="'../../static/'+item.productImg" v-lazy="'../../static/'+item.productImg" alt=""></a>
              </div>
              <div class="main">
                <div class="name">{{item.productName}}</div>
                <div class="price">{{item.productPrice | currency('￥')}}</div>
                <div class="btn-area">
                  <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                </div>
              </div>
            </li>
          </ul>
          <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="40">
          	<img src="./../assets/loading-bubbles.svg" v-show="loading">
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="md-overlay" v-show="overLayFlag" @click="closePop">
</div>
  <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
    <h2 slot="message">
      请先登陆再加入购物车!
    </h2>
    <div slot="btnGroup">
      <a class="btn btn--m" @click="closeModal">关闭</a>
    </div>
  </modal>
  <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
    <h2 slot="message">
      成功加入购物车!
    </h2>
    <div slot="btnGroup">
      <a class="btn btn--m" href="javascript:;" @click="closeModal">继续购物</a>
      <router-link class="btn btn--m"  href="javascript:;" to="/cart">查看购物车</router-link>
    </div>
  </modal>
<nav-footer></nav-footer>
</div>
</template>

<script>
	import './../assets/css/base.css'
	import './../assets/css/product.css'
	import NavHeader from '@/components/NavHeader.vue'
	import NavFooter from '@/components/NavFooter.vue'
	import NavBread from '@/components/NavBread.vue'
  import Modal from '@/components/Modal.vue'
	import axios from 'axios'
  import {currency} from "../util/currency";

  export default {
		data() {
			return{
				goodsList:[],
				sortFlag:true,
				page:1,
				pageSize:8,
				busy:true,
				loading:false,
        mdShow:false,
        mdShowCart:false,
				priceFilter:[
				{
					startPrice:'￥0.00',
					endPrice:'￥500.00'
				},
				{
					startPrice:'￥500.00',
					endPrice:'￥1000.00'
				},
				{
					startPrice:'￥1000.00',
					endPrice:'￥1500.00'
				},
				{
					startPrice:'￥1500.00',
					endPrice:'￥2000.00'
				}
				],
				overLayFlag:false,
				priceChecked:'all',
				filterby:false,
				priceLevel:'all'
			}
		},
		components:{
			NavHeader,
			NavFooter,
			NavBread,
      Modal
		},
		mounted: function (){
			this.getGoodsList();
		},
		methods:{
		getGoodsList (flag) {
		  //传参进行累加
			let params = {
				page:this.page,
				pageSize:this.pageSize,
				sort:this.sortFlag?1:-1,
				priceLevel:this.priceLevel
			};
			this.loading = true;
			axios.get("/goods/list",{
				params:params
			}).then((response)=>{
				this.loading = false;
				let res = response.data;
				if (res.status=="0") {
					if (flag) {
						this.goodsList = this.goodsList.concat(res.result.list);
						//多次累加
						if(res.result.count==0){
							this.busy = true;
						}else{
							this.busy = false;
						}
					}else{
						this.goodsList = res.result.list;
						//第一次累加
						this.busy = false;
					}
				} else{
					this.goodsList = [];
				}					
			});
		},
		showFilterPop () {
			this.filterby = true;
			this.overLayFlag = true;
		},
		setPriceFilter (index) {
			this.priceChecked = index;
			this.priceLevel = index;
			this.page = 1;
			this.closePop();
			this.getGoodsList();
		},
		setAllFilter () {
			this.priceChecked = 'all';
			this.priceLevel = 'all';
			this.page = 1;
			this.closePop();
			this.getGoodsList();
		},
		closePop () {
			this.filterby = false;
			this.overLayFlag = false;
		},
		sortGoods () {
			this.sortFlag = !this.sortFlag;
			this.page = 1;
			this.getGoodsList();
		},
		loadMore  () {
      this.busy = true;
      setTimeout(() => {
        this.page++;
        this.getGoodsList(true);
      }, 1000);
    },
    addCart(productId) {
    	axios.post("/goods/addCart",{
    		productId:productId
    	}).then((response)=>{
    	  let res = response.data;
    	  if (res.status==0){
          this.mdShowCart = true;
          this.$store.commit("updateCartCount",1);
        }else {
          this.mdShow = true;
        }
    	});
    },
      closeModal () {
        this.mdShow = false;
        this.mdShowCart = false;
      }
		}
	}

</script>

<style>
</style>
