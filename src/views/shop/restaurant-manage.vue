<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.name" placeholder="餐厅名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.phone" placeholder="餐厅电话"></el-input>
        </el-form-item>
        <el-form-item>
          <el-cascader
            placeholder="输入地区进行搜索"
            :options="options"
            v-model="selectedOptions"
            filterable
          ></el-cascader>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getRestaurants">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="restaurants"
      :default-sort="{prop: 'id', order: 'descending'}"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="selsChange"
      style="min-width: 100%;"
      v-loading="loading"
      overflow: auto
      >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="expand">
      <template slot-scope="props">
        <el-form label-position="left" inline class="demo-table-expand">
          <el-form-item label="联系方式">
            <span>{{ props.row.phone }}</span>
          </el-form-item>
          <el-form-item label="配送范围">
            <span>{{ props.row.deliveryArea }}</span>
          </el-form-item>
          <el-form-item label="营业时间">
            <span>{{ props.row.beginTime }} -- {{ props.row.endTime }}</span>
          </el-form-item>
          <el-form-item label="餐厅地址">
            <span>{{ props.row.address }}</span>
          </el-form-item>
          <el-form-item label="餐厅简介">
            <span>{{ props.row.description }}</span>
          </el-form-item>
          <el-form-item label="餐厅实景">
              <img v-for="(item,index) in props.row.photos" :src="item" :key="index" width="70" height="70"/>
          </el-form-item>
           <el-form-item label="营业执照">
             <img v-for="(item,index) in props.row.licenses" :src="item" :key="index" width="70" height="70"/>
          </el-form-item>
        </el-form>
      </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="餐厅名称"></el-table-column>
      <el-table-column prop="mainFoods" label="主营菜品"></el-table-column>
      <el-table-column prop="pic" label="餐厅头像">
        <!-- 图片的显示 -->
        <template slot-scope="scope">
          <img :src="scope.row.pic" min-width="70" height="70">
        </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="star" width="170" label="餐厅评价">
        <!-- 评分的显示 -->
        <template slot-scope="scope">
          <el-rate
            v-model="scope.row.star"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}"
          ></el-rate>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="avg" label="人均消费"></el-table-column>
      <el-table-column  prop="status" label="店铺状态" 
      :formatter="statusFormatter"
      :filters="[{ text: '休息中', value: 2 },{ text: '正常营业', value: 1 }, { text: '封禁', value: 0 }, { text: '审核中', value: 3 }]"
      :filter-method="filterStatus"
      ></el-table-column>
      <el-table-column label="操作" width="280">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
           <el-button type="info" size="small" @click="toRoom(scope.$index, scope.row)">房间管理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination
        layout="total,prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :total="this.total"
        :page-size="10"
        style="float:right;"
      ></el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-steps :active="active" finish-status="success" simple>
        <el-step title="步骤 1" ></el-step>
        <el-step title="步骤 2" ></el-step>
        <el-step title="步骤 3" ></el-step>
      </el-steps>
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <div v-if="active === 0">
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="餐厅名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <!-- 账户登录完成后，可以从登陆账户中选取 -->
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="主营菜品" prop="mainFoods">
          <el-input v-model="editForm.mainFoods" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="餐厅描述" prop="description">
          <el-input type="textarea" v-model="editForm.description"></el-input>
        </el-form-item>
        <el-form-item label="营业时间">
          <el-time-select
            placeholder="起始时间"
            v-model="editForm.beginTime"
            :picker-options="{
              start: '05:30',
              step: '00:15',
              end: '23:30'
            }">
          </el-time-select>
          <el-time-select
            placeholder="结束时间"
            v-model="editForm.endTime"
            :picker-options="{
              start: '05:30',
              step: '00:15',
              end: '23:30',
            }">
          </el-time-select>
        </el-form-item>
        </div>
        <div v-if="active === 1">
        <el-form-item label="地区选择" prop="ids">
          <el-cascader
            placeholder="输入地区进行搜索"
            :options="options"
            v-model="selectedOptions"
            filterable
          ></el-cascader>
        </el-form-item>
         <el-form-item label="详细地址" prop="address">
          <el-input v-model="editForm.address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="配送范围(公里)" prop="deliveryArea">
          <el-input-number v-model="editForm.deliveryArea" :step="0.1" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="餐厅头像" prop="pic">
          <el-upload
            action="http://api.anntly.com/api/upload/image"
            list-type="picture-card"
            accept="image/*"
            :limit="picLimit"
            :file-list="picImgs"
            :multiple="isMultiple"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :on-exceed="handleExceed"
            :on-error="imgUploadError"
            :headers="myHeaders"
            :with-credentials='true'
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt>
          </el-dialog>
        </el-form-item>
        </div>
        <div v-if="active === 2">
      <el-form-item label="餐厅实景" prop="photo">
          <el-upload
            action="http://api.anntly.com/api/upload/image"
            list-type="picture-card"
            accept="image/*"
            :limit="photoLimit"
            :file-list="photoImgs"
            :multiple="isMultiple"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handlePhotoSuccess"
            :before-upload="beforeAvatarUpload"
            :on-exceed="handleExceed"
            :on-error="imgUploadError"
            :headers="myHeaders"
            :with-credentials='true'
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt>
          </el-dialog>
        </el-form-item>
        <el-form-item label="营业执照" prop="license">
          <el-upload
            action="http://api.anntly.com/api/upload/image"
            list-type="picture-card"
            accept="image/*"
            :limit="licenseLimit"
            :file-list="licenseImgs"
            :multiple="isMultiple"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handleLicenceSuccess"
            :before-upload="beforeAvatarUpload"
            :on-exceed="handleExceed"
            :on-error="imgUploadError"
            :headers="myHeaders"
            :with-credentials='true'
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt>
          </el-dialog>
        </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="this.active > 0" style="margin-top: 12px;" @click="prev">上一步</el-button>
        <el-button v-show="this.active < 2" style="margin-top: 12px;" @click="next">下一步</el-button>
        <el-button @click.native="dialogFormVisible=false">取消</el-button>
        <el-button v-if="dialogStatus=='create' && this.active === 2" type="primary" @click="createData">添加</el-button>
        <el-button v-if="dialogStatus=='update' && this.active === 2" type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  getRestaurantListPage,
  removeRestaurant,
  batchRestaurant,
  editRestaurant,
  addRestaurant,
} from "@/api/restaurant";
import { getArea } from "@/api/area";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

var token = `Bearer ${localStorage.JWT_TOKEN}` // 要保证取到

export default {
  name: "RestaurantManage",
  data() {
    return {
      myHeaders: {Authorization: token},
      active: 0,
      loading: true,
      options: [], // 级联选择器结果
      selectedOptions: [], // 用户 edit时，回显的数据
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      filters: {
        id: null,
        name: "",
        aid: null,
        phone: "",
        status: 0
      },
      key: "",
      restaurants: [],
      total: 0,
      totalPage: 0,
      page: 1,
      sortBy: "",
      desc: false,
      sels: [], // 列表选中列
      editFormRules: {},
      // 编辑界面数据
      editForm: {
        id: 0,
        name: "",
        phone: "",
        mainFoods: "",
        description: "",
        beginTime: '',
        endTime: '',
        ids: [],
        address: "",
        deliveryArea: "",
        pic: "",
        photo: "",
        license: ""
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {},
      dialogImageUrl: "",
      dialogVisible: false,
      picImgs: [], // 文件列表
      photoImgs: [], // 文件列表
      licenseImgs: [], // 文件列表
      isMultiple: true,
      picLimit: 1, // 上传文件数量
      photoLimit: 3, // 上传文件数量
      licenseLimit: 3, // 上传文件数量
      dialogStatus: ""
    };
  },
  methods: {
    toRoom(index,row){
      this.$router.push({name: 'RoomManage',params:{ id:row.id,restaurantName:row.name}});
    },
    next() {
        this.active ++;
      },
    prev() {
    // 切换步骤条
      this.active --;
      },
    filterStatus(value, row) {
        return row.status === value;
      },
    statusFormatter(row, column) {
      if(row.status === 2){
        return "休息中"
      }else if(row.status === 1){
        return "正常营业中"
      }else if(row.status === 3){
        return "审核中"
      }else{
        return "封禁"
      }
    },
    handleRemove(file, fileList) {
      //移除图片
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      //预览图片时调用
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    beforeAvatarUpload(file) {
      //文件上传之前调用做一些拦截限制
      console.log(file);
      const isJPG = true;
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      //图片上传成功
      this.editForm.pic = res;
    },
    handlePhotoSuccess(res, file) {
      //图片上传成功
      this.editForm.photo += res + ",";
    },
    handleLicenceSuccess(res, file) {
      //图片上传成功
      this.editForm.license  += res + ",";
    },
    handleExceed(files, fileList) {
      //图片上传超过数量限制
      this.$message.error("上传图片不能超过限制!");
      console.log(file, fileList);
    },
    imgUploadError(err, file, fileList) {
      //图片上传失败调用
      console.log(err);
      this.$message.error("上传图片失败!");
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getRestaurants();
    },
    // 处理filters的数据
    checkObj(para) {
      if (
       false
      ) {
        Message({
          message: "请输入合法参数",
          type: "error",
          duration: 5 * 1000
        });
        return;
      }
      this.filters.aid = this.selectedOptions[this.selectedOptions.length - 1]
      para.key = JSON.stringify(this.filters);
      getRestaurantListPage(para)
        .then(res => {
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.restaurants = res.items;
          this.loading = false;
          this.filters = {}
        })
        .catch();
    },
    // 获取用户列表
    getRestaurants() {
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    getOptions() {
      getArea().then(res => (this.options = res));
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removeRestaurant(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getRestaurants();
          });
        })
        .catch(() => {});
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      // 获取需要修改的分类的cid
       // 获取需要修改的分类的cid
      this.selectedOptions = row.ids;
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: 0,
        name: "",
        phone: "",
        mainFoods: "",
        description: "",
        beginTime: '',
        endTime: '',
        ids: [],
        address: "",
        deliveryArea: "",
        pic: "",
        photo: "",
        license: ""
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = {
                id: this.editForm.id,
                name: this.editForm.name,
                phone: this.editForm.phone,
                mainFoods: this.editForm.mainFoods,
                description: this.editForm.mainFoods,
                beginTime: this.editForm.beginTime,
                endTime: this.editForm.endTime,
                pid: this.selectedOptions[0],
                cid: this.selectedOptions[1],
                aid: this.selectedOptions[2],
                nid: this.selectedOptions.length === 4 ?this.selectedOptions[3]:0,
                address: this.editForm.address,
                deliveryArea: this.editForm.deliveryArea,
                pic: this.editForm.pic,
                photo: this.editForm.photo.TrimEnd(','),
                license: this.editForm.license.TrimEnd(',')
              };
              editRestaurant(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getRestaurants();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 新增
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              // const para = Object.assign({}, this.editForm);
              this.selectedOptions.pop
              console.log("选择的地区:"+this.selectedOptions)
              const para = {
                id: this.editForm.id,
                name: this.editForm.name,
                phone: this.editForm.phone,
                mainFoods: this.editForm.mainFoods,
                description: this.editForm.mainFoods,
                beginTime: this.editForm.beginTime,
                endTime: this.editForm.endTime,
                pid: this.selectedOptions[0],
                cid: this.selectedOptions[1],
                aid: this.selectedOptions[2],
                nid: this.selectedOptions.length === 4 ?this.selectedOptions[3]:0,
                address: this.editForm.address,
                deliveryArea: this.editForm.deliveryArea,
                pic: this.editForm.pic,
                photo: this.editForm.photo.TrimEnd(','),
                license: this.editForm.license.TrimEnd(',')
              };
              console.log(para);
              addRestaurant(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.getRestaurants();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels;
    },
    // 批量删除
    batchRemove() {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm("确认删除选中记录吗？", "提示", {
        type: "warning"
      })
        .then(() => {
          const para = { ids: ids };
          batchRestaurant(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getRestaurants();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order == "ascending";
      this.getRestaurants();
    }
  },
  created() {},
  mounted() {
    this.getOptions();
    this.getRestaurants();
  }
};
</script>
<style scoped>
.demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
