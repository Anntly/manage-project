<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.name" placeholder="菜名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.startPrice" placeholder="起始价"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.endPrice" placeholder="最高价"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getFoods">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      </el-form>
    </el-col>

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
      <el-table-column sortable="custom" prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="菜品名"></el-table-column>
      <el-table-column sortable="custom" prop="price" label="菜品价格"></el-table-column>
      <el-table-column prop="pic" label="图片">
        <!-- 图片的显示 -->
        <template slot-scope="scope">
          <img :src="scope.row.pic" min-width="70" height="70">
        </template>
      </el-table-column>
      <el-table-column prop="cid" label="分类ID" :formatter="arrayFormatter"></el-table-column>
      <!--<el-table-column prop="cname" label="分类名称" width="120">-->
      <!--</el-table-column>-->
      <el-table-column prop="saleable" label="上/下架">
        <template scope="scope">
          <el-switch
            on-text="是"
            off-text="否"
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="scope.row.saleable"
            @change="changeSale(scope.$index,scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="update_time" label="更新时间" width="120"></el-table-column>
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
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="editForm.price" :step="0.1" :precision="2" :min="0"></el-input-number>
        </el-form-item>

        <el-form-item label="图片" prop="pic">
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
        <el-form-item label="分类ID" prop="cid">
          <el-cascader
            placeholder="输入分类进行搜索"
            :options="options"
            v-model="selectedOptions"
            filterable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormVisible=false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  getFoodListPage,
  removeFood,
  batchRemoveFood,
  editFood,
  addFood,
  changeSaleStatus
} from "@/api/dishTable";
import { getCas, getIds, getNodes } from "@/api/category";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

export default {
  name: "dishManage",
  data() {
    return {
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
        name: "",
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
        id: 0,
        name: "",
        price: 0.0,
        pic: "",
        cid: []
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {},
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: ""
    };
  },
  methods: {
    arrayFormatter(row, column) {
      // 在childrens中查询cid对应的值
      var obj = this.childrens.find(function(x) {
        return x.id === row.cid;
      });
      return obj.name;
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
      this.getFoods();
    },
    // 处理filters的数据
    checkObj(para) {
      if (
        para.key.startPrice < 0 ||
        para.key.endPrice < 0 ||
        para.key.startPrice > para.key.endPrice
      ) {
        Message({
          message: "请输入合法参数",
          type: "error",
          duration: 5 * 1000
        });
        return;
      }
      para.key = JSON.stringify(this.filters);
      getFoodListPage(para)
        .then(res => {
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.foods = res.items;
          this.loading = false
        })
        .catch();
    },
    // 获取用户列表
    getFoods() {
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    getOptions() {
      getCas().then(res => (this.options = res));
    },
    getChildrens() {
      getNodes().then(res => (this.childrens = res));
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removeFood(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getFoods();
          });
        })
        .catch(() => {});
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      // 获取需要修改的分类的cid
      const id = row.cid;
      getIds(id).then(res => {
        this.selectedOptions = res;
      });
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: 0,
        name: "",
        price: 0.0,
        pic: "",
        cid: []
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              // const para = Object.assign({}, this.editForm);
              // para.birth =
              //   !para.birth || para.birth === ''
              //     ? ''
              //     : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd')
              const para = {
                id: this.editForm.id,
                name: this.editForm.name,
                price: this.editForm.price,
                pic: this.editForm.pic,
                cid: this.selectedOptions[this.selectedOptions.length - 1]
              };
              editFood(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getFoods();
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
              const para = {
                id: this.editForm.id,
                name: this.editForm.name,
                price: this.editForm.price,
                pic: this.editForm.pic,
                cid: thisselectedOptions[this.selectedOptions.length - 1]
              };
              console.log(para);
              addFood(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.getFoods();
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
          batchRemoveFood(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getFoods();
          });
        })
        .catch(() => {});
    },
    // 菜品上下架
    changeSale(index, row) {
      changeSaleStatus(row.id);
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order == "ascending";
      this.getFoods();
    }
  },
  created() {
    
  },
  mounted() {
    this.getOptions();
    this.getChildrens();
    this.getFoods();
  }
};
</script>
<style scoped>
</style>
