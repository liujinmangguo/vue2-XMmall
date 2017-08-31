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
          <a href="javascript:void(0)" class="price" @click="sortGoods()">Price <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop()">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show': filterBy}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd @click="setPriceFilter('all')"><a href="javascript:void(0)" v-bind:class="{'cur': priceChecked=='all'}">All</a></dd>
              <dd v-for="(price,index) in priceFilter" @click="setPriceFilter(index)">
                <a href="javascript:void(0)"  v-bind:class="{'cur': priceChecked==index}">{{price.startPrice}} - {{price.endPrice}}</a>
              </dd>
              
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4 list-wrap" >
              <ul>
                <li v-for="(item, index) in goodsList">
                  <div class="pic">
                    <a href="#"><img v-lazy="'/static/'+item.productImage" alt=""></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>  
              </ul>
              <div class="load-more" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-show="overlayFlag" @click="closePop()"></div>
    <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
      <p slot="message">
      请先登录，否则无法加入到购物车中！
      </p>
      <div slot="btnGroup">
        <a href="javascript:;" class="btn btn--m" @click="mdShow=false">关闭</a>
      </div>
    </modal>

    <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
      <p slot="message">
        加入购物车成功！
        <svg class="navbar-cart-logo">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-cart"></use>
        </svg>
      </p>
      <div slot="btnGroup">
        <a href="javascript:;" class="btn btn--m" @click="mdShowCart=false">继续购物</a>
        <router-link href="javascript:;" class="btn btn--m" to="/cart">查看购物车</router-link>
      </div>
    </modal>
    <nav-footer></nav-footer>
  </div>
</template>

<script>
  import '@/assets/css/base.css';
  import '@/assets/css/product.css';

  import NavHeader from '@/components/NavHeader.vue';
  import NavFooter from '@/components/NavFooter.vue';
  import NavBread from '@/components/NavBread.vue';
  import Modal from '@/components/modal.vue';
  import axios from 'axios';

  export default{
    data(){
        return {
          goodsList: [],
          priceFilter: [
            {
              startPrice: '0.00',
              endPrice: '100.00'
            },
            {
              startPrice: '100.00',
              endPrice: '500.00'
            },
            {
              startPrice: '500.00',
              endPrice: '2000.00'
            },
            {
              startPrice: '2000.00',
              endPrice: '5000.00'
            },
          ],
          priceChecked: "all",
          filterBy: false,
          overlayFlag: false,
          sortFlag: true,
          page: 1,
          pageSize: 8,
          busy: true,
          loading: false,
          mdShow: false,
          mdShowCart: false

        }
    },
    components: {
      NavHeader,
      NavFooter,
      NavBread,
      Modal
    },
    mounted: function(){
      this.getGoodsList();
    },
    methods: {
      getGoodsList(flag){
        let param = {
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sortFlag ? 1 : -1,
          priceLevel: this.priceChecked
        }
        this.loading = true;
        axios.get('/goods/list',{
          params: param
        }).then((response)=>{
          let res = response.data;
          this.loading = false;
          if(res.status=='0'){
            //分页：需要判断是否是第一次加载
            if(flag){
              this.goodsList = this.goodsList.concat(res.result.list);
              if(res.result.count==0){
                this.busy = true;  //禁用滚动
              }else{
                this.busy = false; //滚动打开
              }
            }else{
              this.goodsList = res.result.list;
              this.busy = false; //开启第一次滚动加载
            } 
          }else{
            this.goodsList = [];
          }
        });
      },
      showFilterPop(){
        this.filterBy = true;
        this.overlayFlag = true;
      },
      closePop(){
        this.filterBy = false;
        this.overlayFlag = false;
        this.mdShowCart = false;
      },
      setPriceFilter(index){
        this.priceChecked=index;
        this.closePop();
        this.page = 1;
        this.getGoodsList();
      },
      sortGoods(){
        this.sortFlag = !this.sortFlag;
        //重新渲染
        this.page = 1;
        this.getGoodsList();
      },
      loadMore(){
        this.busy = true;
        setTimeout(() => {
          this.page++;
          this.getGoodsList(true); //滚动加载渲染
        }, 500);
      },
      addCart(productId){
        axios.post('/goods/addCart',{
          productId: productId
        }).then((response)=>{
          let res = response.data;
          if(res.status=='0'){
            // alert('假如成功');
            this.mdShowCart = true;
            this.$store.commit("updateCartCount",1);
          }else{
            // alert('msg:' + res.msg)
            this.mdShow = true;
          }
        })
      },
      closeModal(){
        this.mdShow = false;
        this.mdShowCart = false;
      }

    }   
  }
</script>
<style>
  .list-wrap{
    flex: 1;
  }
  /*给列表清除浮动*/
  .list-wrap ul::after{
    clear: both;
    content: '';
    height: 0;
    visibility: hidden;
    display: block;
  }
  .load-more{
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .btn:hover{
    /*background-color: #eee;*/
    transition: all .3s ease-out;
  }
</style>
