<template>
  <div>
    <div id="app">
      <div class="section ml-2">
        <div class="row">
            <div class="col-md-3 toolbox">
                  <p class="text-center bg-secondary mb-0 p-1">口罩剩餘數量明細清單 資料來源:衛服部</p>
                  <div class="sticky-top shadow-sm p-2">
                    <div class="citySelect">
                      <select class="custom-select custom-select-lg mb-3" v-model="select.filter">
                        <option selected>Open this select menu</option>
                        <option :value="item" v-for="(item, key) in cityFilter" :key="key">{{item}}</option>
                      </select>
                    </div>
                    <div class="TownSelect">
                      <select class="custom-select custom-select-lg mb-3" 
                              v-model="select.filter2"
                        >
                        <option :value="item" 
                                v-for="(item, key) in townFilter" 
                                :key="key">
                                {{item}}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="cardGroup">
                    <Card
                        :store="item"
                        v-for="(item, key) in filterData"
                        :key="key"
                        @switchcard="switchGeo"
                        @switchshare="dayBegin"
                      >
                      </Card>
                  </div>
            </div>
            <loading :active.sync="isLoading">
                <div class="col-md-9">
                    <i class="fas fa-sync fa-spin fa-3x" v-if="status.fileUploading">
                      </i>
                </div>
            </loading>
            <div class="col-md-9">
                <div id="map">
                </div>
            </div>
            </div>
          </div>
        </div>
  </div>

</template>

<script>
import Card from "./components/Card.vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";

let osmMap = {};

let iconsConfig = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
};

let iconData = {
  green: new L.Icon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    ...iconsConfig
  }),
  grey: new L.Icon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
    shadowUrl:
       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    ...iconsConfig
  }),
  red: new L.Icon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    ...iconsConfig
  })
};

export default {
  name: "App",
  data() {
    return {
      dataAry: [],
      city: [],
      cityFilter: [],
      town:[],
      townFilter:[],
      cityName:[],
      osmMap: {},
      geoInfo: [],
      markers: [],
      available:[],
      //centerLat: '', 
      //centerLng: '',
      isLoading: true,
      select:{
          filter: "新北市",
          filter2:"新店區"
      },
      status: {
        fileUploading: true
      },
      iconData
    };
  },
  methods: {
    initialMap() {
        //navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position.coords.latitude, position.coords.longitude);  
        osmMap = L.map("map", {
          //center: [position.coords.latitude, position.coords.longitude], // localhost 定位在101
          center: [24.956111, 121.536500],// network定位在碧潭
          zoom: 18
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
          .addTo(osmMap)
      //})
    },

    switchGeo(store) {
      let newLat = store.geometry.coordinates[1];
      let newLng = store.geometry.coordinates[0];
      osmMap.flyTo(new L.LatLng(newLat, newLng));

      L.marker([newLat, newLng]).addTo(osmMap)
        .bindPopup(
          `<h4>${store.properties.name}</h4>
              <p>
                 成人口罩:<mark>${store.properties.mask_adult}</mark><br>
                 兒童口罩:${store.properties.mask_child}<br>
                 診所電話:
                 <a href="tel:+886-${store.properties.phone}">${store.properties.phone}</a>
              </p>`
        ).openPopup();
    },

    dayBegin(store){
       let arr = []
       let avail = store.properties.available.split('、') // 這是整包資料
       //console.log(avail)
       // 星期一上午....星期天上午
       // 星期一下午....星期天下午
       // 星期一晚上...星期天晚上
       this.timeArr = avail.map(item => {
           if(item.indexOf('看') >= 1){
             return 'O'
           }
           return 'X'
       })
       console.log(this.timeArr)

       // 兩件事
       // 1. 顯示出畫面
       // 2. 值可以對應進template

    },

  
    filterColor(count) {
      switch (true) {
        case count >= 10:
          return this.iconData.green;
          break;
        case count < 10 && count > 0:
          return this.iconData.red;
          break;
        case count == 0:
          return this.iconData.grey;
          break;
      }
    },

    dataCreated() {
      this.status.fileUploading = true
      this.isLoading = true

      let markers = new L.MarkerClusterGroup().addTo(osmMap);
      for (let i = 0; i < this.geoInfo.length; i++) {
        this.status.fileUploading = false
        this.isLoading = false  
        markers.addLayer(
          L.marker([this.geoInfo[i].lng, this.geoInfo[i].lat], {
            icon: this.filterColor(this.geoInfo[i].adult)
          }).bindPopup(`<h3>${this.geoInfo[i].name}</h3>
                              <p>
                                成人口罩:${this.geoInfo[i].adult}  
                                兒童口罩:${this.geoInfo[i].child}
                                診所電話:${this.geoInfo[i].phone}
                              </p>`)
        );
      }
      osmMap.addLayer(markers);
    }, 
  },
  computed: {
    filterData() {
      let vm = this;
      if (vm.select.filter == "Open this select menu") {
        return vm.dataAry;
      } else{
        vm.town.length = 0
        vm.dataAry.find(item => {
            if (vm.select.filter === item.properties.county){
                vm.town.push(item.properties.town)
            }
        })
        vm.townFilter = vm.town.filter((item, index, arr) => {
          return vm.town.indexOf(item) === index;
        });
        return vm.dataAry.filter(item => {
          return item.properties.county == vm.select.filter && item.properties.town == vm.select.filter2
        });
      }
    },
  },
  mounted() {
    this.initialMap()
    Promise.all([
      this.axios.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR0TSsgLIAH10XrE6fFk7bRmXyxXd_FK4NZO39yOkcS28rpVfCkQZJit0Dc'), 
      this.$http.get('cityName.json')
    ]).then(([res, cityNameRes]) => {

        this.cityName = cityNameRes.data
        this.dataAry = res.data.features;

        this.dataAry.forEach(item => {
          return this.city.push(item.properties.county);
        });
        
        this.cityFilter = this.city.filter((item, index, arr) => {
          return this.city.indexOf(item) === index;
        });

        let index = this.cityFilter.findIndex(item => {
          return item === ''
        })

        this.cityFilter.splice(index, 1);

        this.dataAry.forEach(item => {
          return this.geoInfo.push({
            name: item.properties.name,
            lat: item.geometry.coordinates[0],
            lng: item.geometry.coordinates[1],
            adult: item.properties.mask_adult,
            child: item.properties.mask_child, 
            phone: item.properties.phone
          });
        });

        this.dataCreated();

    }) 
  },
  components: {
    Card, 
  }
};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap.scss";

// html, body{
//   width: 100%;
//   height: 100%;
// }

body::-webkit-scrollbar {
    display: none;
}

#map {
  height: 100vh;
  overflow: hidden;
}
.marker-cluster-small {
  background-color: rgba(181, 226, 140, 0.6);
}
.marker-cluster-small div {
  background-color: rgba(110, 204, 57, 0.6);
}

.marker-cluster-medium {
  background-color: rgba(241, 211, 87, 0.6);
}
.marker-cluster-medium div {
  background-color: rgba(240, 194, 12, 0.6);
}

.marker-cluster-large {
  background-color: rgba(253, 156, 115, 0.6);
}
.marker-cluster-large div {
  background-color: rgba(241, 128, 23, 0.6);
}

.marker-cluster {
  background-clip: padding-box;
  border-radius: 20px;
}
.marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  border-radius: 15px;
  font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
}
.marker-cluster span {
  line-height: 30px;
}

.toolbox{
  height:100vh; 
  overflow-y: auto;
}

.toolbox > p{
  background-color: #ACBDBC;
}

.sticky-top{
  background-color: #E0E2E0;
}


</style>
