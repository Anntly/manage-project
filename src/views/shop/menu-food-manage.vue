<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.showName" placeholder="菜品名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.startPrice" placeholder="起始价"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.endPrice" placeholder="最高价"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getMenuFoods">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      </el-form>
    </el-col>
    <!-- <el-button type="success" round @click="handleBack()">返回</el-button> -->
    <!--列表-->
    <el-table
      :data="foods"
      :default-sort="{prop: 'id', order: 'descending'}"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="selsChange"
      style="min-width: 100%;"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="菜品图片">
              <img :src="props.row.pic" width="70" height="70">
            </el-form-item>
            <el-form-item label="菜品折扣">
              <span>{{ props.row.discount/10 }} 折</span>
            </el-form-item>
            <el-form-item label="菜品简介">
              <span>{{ props.row.description }}</span>
            </el-form-item>
            <el-form-item label="菜单名称">
              <span>{{ menuName }}</span>
            </el-form-item>
            <el-form-item label="餐厅名称">
              <span>{{ restaurantName }}</span>
            </el-form-item>
            <el-form-item label="菜品分类名称">
              <span>{{ props.row.categoryName }}</span>
            </el-form-item>
            <el-form-item label="月销售">
              <span>{{ props.row.monthAmount }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ props.row.create_time }}</span>
            </el-form-item>
            <el-form-item label="更新时间">
              <span>{{ props.row.update_time }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="id" label="菜单菜品ID"></el-table-column>
      <el-table-column v-if="false" prop="foodId" label="菜品ID"></el-table-column>
      <el-table-column prop="showName" label="菜品名称"></el-table-column>
      <el-table-column v-if="false" prop="mCid" label="菜品分类ID"></el-table-column>
      <el-table-column sortable="custom" prop="price" label="菜品定价"></el-table-column>
      <el-table-column sortable="custom" prop="stock" label="菜品库存"></el-table-column>
      <el-table-column prop="status" label="上/下架">
        <template scope="scope">
          <el-switch
            on-text="是"
            off-text="否"
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="scope.row.status"
            @change="changeSaleStatus(scope.$index,scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="recommend" label="是否为推荐菜品">
        <template scope="scope">
          <el-switch
            on-text="是"
            off-text="否"
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="scope.row.recommend"
            @change="changeRecommend(scope.$index,scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="star" width="170" label="菜品评价">
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
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
        <el-step title="步骤 1"></el-step>
        <el-step title="步骤 2"></el-step>
        <el-step title="步骤 3"></el-step>
      </el-steps>
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <div v-if="active === 0">
          <el-form-item v-if="false" label="ID" prop="id">
            <el-input v-model="editForm.id" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="false" label="menuId" prop="menuId">
            <el-input v-model="editForm.menuId" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="false" label="restaurantId" prop="restaurantId">
            <el-input v-model="editForm.restaurantId" auto-complete="off"></el-input>
          </el-form-item>

          <el-form-item label="菜品分类" prop="cid">
            <el-cascader
              placeholder="输入分类进行搜索(参考菜品)"
              :options="options"
              v-model="selectedOptions"
              filterable
            ></el-cascader>
          </el-form-item>
          <el-form-item label="菜品选择" prop="foodId">
            <el-select
              v-model="editForm.foodId"
              :disabled="sel"
              clearable
              filterable
              placeholder="请选择菜品(参考菜品)"
            >
              <el-option
                :loading="loading"
                v-for="item in foodList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="菜品名称" prop="showName">
            <el-input v-model="editForm.showName" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="菜品描述" prop="description">
            <el-input type="textarea" v-model="editForm.description"></el-input>
          </el-form-item>
        </div>
        <div v-if="active === 1">
          <el-form-item label="菜品价格" prop="price">
            <el-input-number v-model="editForm.price" :step="0.5" :precision="2" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="菜品折扣" prop="discount">
            <el-input-number
              v-model="editForm.discount"
              :step="0.5"
              :precision="2"
              :min="0"
              :max="10"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="菜品分类" prop="mCid">
            <el-select v-model="editForm.mCid" filterable placeholder="请选择(菜单菜品)">
              <el-option
                v-for="item in mCats"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div v-if="active === 2">
          <el-form-item label="菜品库存" prop="stock">
            <el-input-number v-model="editForm.stock" :step="1" :precision="2" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="菜品图片" prop="pic">
            <el-upload
              action="http://api.anntly.com/api/upload/image"
              list-type="picture-card"
              accept="image/*"
              :limit="imgLimit"
              :file-list="productImgs"
              :multiple="isMultiple"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :on-exceed="handleExceed"
              :on-error="imgUploadError"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt>
            </el-dialog>
          </el-form-item>
          <el-form-item label="推荐菜品" prop="recommend">
            <el-switch v-model="editForm.recommend"></el-switch>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-show="this.active > 0" style="margin-top: 12px;" @click="prev">上一步</el-button>
        <el-button v-show="this.active < 2" style="margin-top: 12px;" @click="next">下一步</el-button>
        <el-button @click.native="dialogFormVisible=false">取消</el-button>
        <el-button
          v-if="dialogStatus=='create' && this.active === 2"
          type="primary"
          @click="createData"
        >添加</el-button>
        <el-button
          v-if="dialogStatus=='update' && this.active === 2"
          type="primary"
          @click="updateData"
        >修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  removeMenuFood,
  batchRemoveMenuFood,
  editMenuFood,
  addMenuFood,
  getMenuFoodPage,
  changeStatus,
  changeRecommendStatus,
  getCatNodes
} from "@/api/dishMenu";
import { getCas } from "@/api/category";
import { getFoodNodes } from "@/api/dishTable";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

export default {
  name: "MenuFoodManage",
  data() {
    return {
      active: 0,
      mCats: [],
      sel: true,
      foodList: [],
      restaurantId: this.$route.params.restaurantId,
      restaurantName: this.$route.params.restaurantName,
      menuName: this.$route.params.name,
      menuId: this.$route.params.id,
      restaurants: [],
      loading: true,
      options: [], // 级联选择器结果
      childrens: [], //所有的子节点
      selectedOptions: [], // 用户 edit时，回显的数据
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      filters: {
        id: null,
        menuId: this.menuId,
        showName: "",
        startPrice: null,
        endPrice: null
      },
      key: "",
      foods: [],
      total: 0,
      totalPage: 0,
      page: 1,
      sortBy: "",
      desc: false,
      sels: [], // 列表选中列
      editFormRules: {},
      // 编辑界面数据
      editForm: {
        id: null,
        menuId: this.menuId,
        restaurantId: this.restaurantId,
        showName: "",
        price: 0.0,
        discount: 0.0,
        description: "",
        foodId: null,
        mCid: null,
        stock: 0,
        pic: "",
        recommend: true
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {},
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: "",
      selectedTag: {}
    };
  },
  methods: {
    next() {
      this.active++;
    },
    prev() {
      // 切换步骤条
      this.active--;
    },
    getOptions() {
      getCas().then(res => (this.options = res));
    },
    // 是否为推荐菜品
    changeRecommend(index, row) {
      changeRecommendStatus(row.id);
    },
    // 菜品上下架
    changeSaleStatus(index, row) {
      changeStatus(row.id);
    },
    filterStatus(value, row) {
      return row.status === value;
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
    handleExceed(files, fileList) {
      //图片上传超过数量限制
      this.$message.error("上传图片不能超过1张!");
      console.log(file, fileList);
    },
    imgUploadError(err, file, fileList) {
      //图片上传失败调用
      console.log(err);
      this.$message.error("上传图片失败!");
    },
    // 性别显示转换
    formatSex: function(row, column) {
      return row.sex === 1 ? "男" : row.sex === 0 ? "女" : "未知";
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getMenuFoods();
    },
    // 处理filters的数据
    checkObj(para) {
      para.key = JSON.stringify(this.filters);
      getMenuFoodPage(para)
        .then(res => {
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.foods = res.items;
          this.loading = false;
          this.filters = {};
        })
        .catch();
    },
    // 获取用户列表
    getMenuFoods() {
      this.filters.menuId = this.menuId;
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    // 获取用户列表
    getFoodSelectNodes(cid) {
      getFoodNodes(cid).then(res => {
        this.foodList = res;
        this.sel = false;
      });
    },
    // 获取用户列表
    getCatSelectNodes(menuId) {
      getCatNodes(menuId).then(res => {
        this.mCats = res;
      });
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removeMenuFood(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getMenuFoods();
          });
        })
        .catch(() => {});
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: null,
        menuId: this.menuId,
        restaurantId: this.restaurantId,
        showName: "",
        price: 0.0,
        discount: 0.0,
        description: "",
        foodId: null,
        mCid: null,
        stock: 0,
        pic: "",
        recommend: true
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = Object.assign({}, this.editForm);
              editMenuFood(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;

                this.filters.menuId = this.menuId;
                this.getMenuFoods();
                this.selectedOptions = [];
                this.sel = true;
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
              this.editForm.discount = Math.ceil(this.editForm.discount * 10);
              const para = Object.assign({}, this.editForm);
              addMenuFood(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.filters.menuId = this.menuId;
                this.getMenuFoods();
                this.selectedOptions = [];
                this.sel = true;
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
          batchRemoveMenuFood(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getMenuFoods();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order === "ascending";
      this.getMenuFoods();
    }
  },
  created: function() {},
  mounted() {
    this.getMenuFoods();
    this.getOptions();
    this.getCatSelectNodes(this.menuId);
  },
  watch: {
    selectedOptions: function(val) {
      if (val.length > 0) {
        this.getFoodSelectNodes(val[val.length - 1]);
      }
    }
  }
};
</script>
<style scoped>
.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}

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
