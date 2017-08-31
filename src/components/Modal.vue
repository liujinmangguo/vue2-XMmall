<template>
    <div>
        <div class="md-modal modal-msg md-modal-transition" v-bind:class="{'md-show':mdShow}">
          <div class="md-modal-inner">
            <div class="md-top">
            <!-- //这里只能用closeModal -->
              <button class="md-close" @click="closeModal">Close</button> 
            </div>
            <div class="md-content">
              <div class="confirm-tips">
                <slot name="message"></slot>
                <div class="btn-wrap">
                    <slot name="btnGroup"></slot>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- //这里只能用closeModal -->
        <div class="md-overlay" v-if="mdShow" @click="closeModal"></div> 

    </div>
</template>

<script>
    export default{  
        props: ['mdShow'],  //只能从父组件传递过来，子组件无法改变
        data(){
            return{
            }
        },
        methods: {
            closeModal(){
                this.$emit("close");  //触发父组件事件

            }
        }
    
    }
</script>
