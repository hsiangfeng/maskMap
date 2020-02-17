<template>
    <div>
      <div class="card mt-2" @click="setFocus">
        <div class="card-body" :class="store.properties.mask_adult > 30 ? 'hightlight': 'normal'">
          <h4 class="card-title mt-3">{{store.properties.name}}</h4>
          <p><i class="fas fa-home mr-2"></i>
            <a :href="getHref(store.properties.address)" target="_blank">{{store.properties.address}}</a>
          </p>
          <p><i class="fas fa-phone mr-2 mt-1"></i>
            <a href="tel:+886-${store.properties.phone}">{{store.properties.phone}}</a>
          </p>
            <small class="card-text">最後更新時間: {{store.properties.updated}}</small>
        </div>
      </div>  
      <div class="bottom pt-1 pb-1" @click="clickHandler">
          <i class="fas fa-share-alt mt-1"></i>
          <p class="card-text">成人口罩: {{store.properties.mask_adult}} | 兒童口罩: {{store.properties.mask_child}}</p>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Card',
  props: ['store'],
  methods:{
    getHref(address){
	    return `https://www.google.com.tw/maps/place/${address}`
    }, 
    setFocus(){
        this.$emit('switchcard', this.store)
    }, 
    clickHandler(){
        //console.log(123)
        this.$emit('switchshare', this.store)
    }
  }
}
</script>

<style scoped>
.hightlight{
  background-color: #e9ffe3;
}

p{
  margin-bottom: 0px;
}

.normal{
  background-color: #E0E2E0;
}

.normal2{
  background-color: #DD7D5A;
}

.card{
  position: relative;
}

small{
  position: absolute;
  top:10px;
  right: 10px; 
  color:#7f8f9f;
}

.bottom{
  padding-left:20px;
  background-color: #DD7D5A;
  border-radius: 5px;
  position: relative;
}

.fa-share-alt{
  position: absolute;
  right:10px;
  cursor: pointer;
}

</style>
